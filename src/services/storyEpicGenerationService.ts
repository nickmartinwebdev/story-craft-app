import {
  ExtractedInformation,
  UserStory,
  Epic,
  GeneratedContent,
  AcceptanceCriteria,
  UserPersona,
  ProjectGoal,
  BusinessContext,
  Constraint,
  Assumption,
} from "../types/enhanced-proposals";

export class StoryEpicGenerationService {
  private static instance: StoryEpicGenerationService;

  public static getInstance(): StoryEpicGenerationService {
    if (!StoryEpicGenerationService.instance) {
      StoryEpicGenerationService.instance = new StoryEpicGenerationService();
    }
    return StoryEpicGenerationService.instance;
  }

  /**
   * Generate user stories from extracted information
   */
  public generateUserStories(extractedInfo: ExtractedInformation): UserStory[] {
    const stories: UserStory[] = [];

    // Generate stories for each persona-goal combination
    extractedInfo.personas.forEach((persona) => {
      extractedInfo.goals.forEach((goal) => {
        const relatedContexts = this.findRelatedContexts(
          persona,
          goal,
          extractedInfo.contexts,
        );
        const relatedConstraints = this.findRelatedConstraints(
          persona,
          goal,
          extractedInfo.constraints,
        );

        // Generate primary story for this persona-goal pair
        const primaryStory = this.createStoryFromPersonaGoal(
          persona,
          goal,
          relatedContexts,
          relatedConstraints,
        );

        if (primaryStory) {
          stories.push(primaryStory);
        }

        // Generate supporting stories based on persona pain points
        persona.painPoints.forEach((painPoint, painPointIndex) => {
          const supportingStory = this.createStoryFromPainPoint(
            persona,
            painPoint,
            goal,
            painPointIndex,
            relatedConstraints,
          );
          if (supportingStory) {
            stories.push(supportingStory);
          }
        });
      });
    });

    // Generate technical stories from constraints
    const technicalStories = this.generateTechnicalStories(
      extractedInfo.constraints,
    );
    stories.push(...technicalStories);

    return this.deduplicateStories(stories);
  }

  /**
   * Generate epics from user stories
   */
  public generateEpics(
    userStories: UserStory[],
    extractedInfo: ExtractedInformation,
  ): Epic[] {
    const epics: Epic[] = [];

    // Group stories by theme/functionality
    const storyGroups = this.groupStoriesByTheme(userStories);

    Object.entries(storyGroups).forEach(([theme, stories]) => {
      const epic = this.createEpicFromStories(theme, stories, extractedInfo);
      if (epic) {
        epics.push(epic);
      }
    });

    // Create epics for major goals that don't fit into other themes
    extractedInfo.goals
      .filter((goal) => goal.priority === "high")
      .forEach((goal) => {
        const relatedStories = userStories.filter((story) =>
          story.relatedGoals.includes(goal.id),
        );

        if (relatedStories.length > 0) {
          const existingEpic = epics.find((epic) =>
            epic.relatedGoals.includes(goal.id),
          );

          if (!existingEpic) {
            const goalEpic = this.createEpicFromGoal(
              goal,
              relatedStories,
              extractedInfo,
            );
            if (goalEpic) {
              epics.push(goalEpic);
            }
          }
        }
      });

    return this.prioritizeEpics(epics);
  }

  /**
   * Generate complete content (stories + epics)
   */
  public generateContent(
    extractedInfo: ExtractedInformation,
  ): GeneratedContent {
    const userStories = this.generateUserStories(extractedInfo);
    const epics = this.generateEpics(userStories, extractedInfo);

    return {
      userStories,
      epics,
      lastGenerated: new Date(),
      generationNotes: this.generateNotes(userStories, epics, extractedInfo),
    };
  }

  // Private helper methods

  private createStoryFromPersonaGoal(
    persona: UserPersona,
    goal: ProjectGoal,
    contexts: BusinessContext[],
    constraints: Constraint[],
  ): UserStory | null {
    const storyId = `story-${persona.id}-${goal.id}`;

    // Generate story components
    const asA = `${persona.role}`;
    const iWant = this.generateIWantFromGoal(goal, contexts);
    const soThat = this.generateSoThatFromGoal(goal, persona);

    if (!iWant || !soThat) return null;

    const acceptanceCriteria = this.generateAcceptanceCriteria(
      goal,
      persona,
      constraints,
    );

    return {
      id: storyId,
      title: `${persona.role} - ${goal.description.substring(0, 50)}...`,
      description: `Enable ${persona.role.toLowerCase()} to ${goal.description.toLowerCase()}`,
      asA,
      iWant,
      soThat,
      acceptanceCriteria,
      priority: goal.priority,
      estimatedEffort: this.estimateEffortFromGoal(goal),
      tags: this.generateTagsFromGoal(goal, contexts),
      relatedPersonas: [persona.id],
      relatedGoals: [goal.id],
      constraints: constraints.map((c) => c.id),
      createdFrom: [
        ...persona.extractedFrom,
        ...goal.extractedFrom,
        ...contexts.flatMap((c) => c.extractedFrom),
      ],
      status: "draft",
    };
  }

  private createStoryFromPainPoint(
    persona: UserPersona,
    painPoint: string,
    goal: ProjectGoal,
    index: number,
    constraints: Constraint[],
  ): UserStory | null {
    const storyId = `story-pain-${persona.id}-${index}`;

    const asA = `${persona.role}`;
    const iWant = `address the issue where ${painPoint.toLowerCase()}`;
    const soThat = `I can work more effectively and ${goal.description.toLowerCase()}`;

    const acceptanceCriteria = this.generateAcceptanceCriteriaFromPainPoint(
      painPoint,
      persona,
    );

    return {
      id: storyId,
      title: `Fix: ${painPoint.substring(0, 50)}...`,
      description: `Resolve pain point: ${painPoint}`,
      asA,
      iWant,
      soThat,
      acceptanceCriteria,
      priority: "medium",
      estimatedEffort: "m",
      tags: ["pain-point", "improvement"],
      relatedPersonas: [persona.id],
      relatedGoals: [goal.id],
      constraints: constraints.map((c) => c.id),
      createdFrom: persona.extractedFrom,
      status: "draft",
    };
  }

  private generateTechnicalStories(constraints: Constraint[]): UserStory[] {
    return constraints
      .filter((constraint) => constraint.type === "technical")
      .map((constraint) => ({
        id: `story-tech-${constraint.id}`,
        title: `Technical: ${constraint.description.substring(0, 50)}...`,
        description: `Address technical constraint: ${constraint.description}`,
        asA: "developer",
        iWant: `ensure the system ${constraint.description.toLowerCase()}`,
        soThat: "the solution meets technical requirements",
        acceptanceCriteria: [
          {
            id: `ac-tech-${constraint.id}-1`,
            description: constraint.description,
            priority: "must" as const,
            testable: true,
          },
        ],
        priority: constraint.severity === "critical" ? "high" : "medium",
        estimatedEffort: constraint.severity === "critical" ? "l" : "m",
        tags: ["technical", "constraint"],
        relatedPersonas: [],
        relatedGoals: [],
        constraints: [constraint.id],
        createdFrom: constraint.extractedFrom,
        status: "draft" as const,
      }));
  }

  private groupStoriesByTheme(
    stories: UserStory[],
  ): Record<string, UserStory[]> {
    const groups: Record<string, UserStory[]> = {};

    stories.forEach((story) => {
      let theme = "General";

      // Determine theme based on story content
      if (story.tags.includes("technical")) {
        theme = "Technical Foundation";
      } else if (story.tags.includes("user-management")) {
        theme = "User Management";
      } else if (story.tags.includes("reporting")) {
        theme = "Reporting & Analytics";
      } else if (story.tags.includes("integration")) {
        theme = "System Integration";
      } else if (story.tags.includes("security")) {
        theme = "Security & Compliance";
      } else if (story.asA.toLowerCase().includes("admin")) {
        theme = "Administration";
      } else if (story.asA.toLowerCase().includes("user")) {
        theme = "User Experience";
      } else if (story.asA.toLowerCase().includes("manager")) {
        theme = "Management & Oversight";
      }

      if (!groups[theme]) {
        groups[theme] = [];
      }
      groups[theme].push(story);
    });

    return groups;
  }

  private createEpicFromStories(
    theme: string,
    stories: UserStory[],
    extractedInfo: ExtractedInformation,
  ): Epic | null {
    if (stories.length === 0) return null;

    const epicId = `epic-${theme.toLowerCase().replace(/\s+/g, "-")}`;

    // Aggregate related information from stories
    const allPersonaIds = [
      ...new Set(stories.flatMap((s) => s.relatedPersonas)),
    ];
    const allGoalIds = [...new Set(stories.flatMap((s) => s.relatedGoals))];
    const allConstraintIds = [
      ...new Set(stories.flatMap((s) => s.constraints)),
    ];

    const relatedGoals = extractedInfo.goals.filter((g) =>
      allGoalIds.includes(g.id),
    );
    const businessValue = this.generateBusinessValueFromGoals(relatedGoals);

    return {
      id: epicId,
      title: theme,
      description: `Comprehensive ${theme.toLowerCase()} functionality`,
      goal: this.generateEpicGoalFromStories(stories, theme),
      businessValue,
      userStories: stories.map((s) => s.id),
      priority: this.determineEpicPriority(stories),
      theme,
      estimatedEffort: this.estimateEpicEffort(stories),
      relatedPersonas: allPersonaIds,
      relatedGoals: allGoalIds,
      constraints: allConstraintIds,
      assumptions: this.findRelevantAssumptions(
        extractedInfo.assumptions,
        allGoalIds,
      ),
      successMetrics: this.generateSuccessMetrics(relatedGoals),
      createdFrom: [...new Set(stories.flatMap((s) => s.createdFrom))],
      status: "draft",
    };
  }

  private createEpicFromGoal(
    goal: ProjectGoal,
    stories: UserStory[],
    extractedInfo: ExtractedInformation,
  ): Epic | null {
    const epicId = `epic-goal-${goal.id}`;

    return {
      id: epicId,
      title: goal.description,
      description: `Epic focused on achieving: ${goal.description}`,
      goal: goal.description,
      businessValue:
        goal.metrics?.join(", ") || "Supports key business objective",
      userStories: stories.map((s) => s.id),
      priority: goal.priority,
      theme: goal.type.charAt(0).toUpperCase() + goal.type.slice(1),
      estimatedEffort: this.estimateEpicEffort(stories),
      relatedPersonas: [...new Set(stories.flatMap((s) => s.relatedPersonas))],
      relatedGoals: [goal.id],
      constraints: [...new Set(stories.flatMap((s) => s.constraints))],
      assumptions: this.findRelevantAssumptions(extractedInfo.assumptions, [
        goal.id,
      ]),
      successMetrics: goal.metrics || ["Goal completion"],
      createdFrom: [
        ...goal.extractedFrom,
        ...stories.flatMap((s) => s.createdFrom),
      ],
      status: "draft",
    };
  }

  private generateAcceptanceCriteria(
    goal: ProjectGoal,
    persona: UserPersona,
    constraints: Constraint[],
  ): AcceptanceCriteria[] {
    const criteria: AcceptanceCriteria[] = [];

    // Primary acceptance criteria from goal
    criteria.push({
      id: `ac-${goal.id}-primary`,
      description: `Successfully ${goal.description.toLowerCase()}`,
      priority: "must",
      testable: goal.measurable,
    });

    // Criteria from persona behaviors
    persona.behaviors.forEach((behavior, index) => {
      criteria.push({
        id: `ac-${goal.id}-behavior-${index}`,
        description: `Support ${behavior.toLowerCase()}`,
        priority: "should",
        testable: true,
      });
    });

    // Criteria from constraints
    constraints.forEach((constraint) => {
      criteria.push({
        id: `ac-${goal.id}-constraint-${constraint.id}`,
        description: `Comply with ${constraint.description.toLowerCase()}`,
        priority: constraint.severity === "critical" ? "must" : "should",
        testable: true,
      });
    });

    return criteria;
  }

  private generateAcceptanceCriteriaFromPainPoint(
    painPoint: string,
    persona: UserPersona,
  ): AcceptanceCriteria[] {
    return [
      {
        id: `ac-pain-${persona.id}`,
        description: `Resolve or significantly reduce: ${painPoint.toLowerCase()}`,
        priority: "must",
        testable: true,
      },
      {
        id: `ac-pain-validation-${persona.id}`,
        description: `${persona.role} can validate the improvement`,
        priority: "should",
        testable: true,
      },
    ];
  }

  // Helper methods for content generation

  private generateIWantFromGoal(
    goal: ProjectGoal,
    contexts: BusinessContext[],
  ): string {
    const contextInfo =
      contexts.length > 0 ? ` in the context of ${contexts[0].title}` : "";
    return `be able to ${goal.description.toLowerCase()}${contextInfo}`;
  }

  private generateSoThatFromGoal(
    goal: ProjectGoal,
    persona: UserPersona,
  ): string {
    if (goal.metrics && goal.metrics.length > 0) {
      return `I can achieve ${goal.metrics[0].toLowerCase()}`;
    }
    if (persona.goals.length > 0) {
      return `I can ${persona.goals[0].toLowerCase()}`;
    }
    return `I can work more effectively`;
  }

  private estimateEffortFromGoal(
    goal: ProjectGoal,
  ): "xs" | "s" | "m" | "l" | "xl" {
    if (goal.priority === "high") return "l";
    if (goal.priority === "medium") return "m";
    return "s";
  }

  private generateTagsFromGoal(
    goal: ProjectGoal,
    contexts: BusinessContext[],
  ): string[] {
    const tags = [goal.type];
    contexts.forEach((context) => {
      // Map context categories to general tags
      switch (context.category) {
        case "technology":
          tags.push("technical");
          break;
        case "regulatory":
          tags.push("business");
          break;
        case "market":
          tags.push("business");
          break;
        case "organizational":
          tags.push("operational");
          break;
        case "competitive":
          tags.push("business");
          break;
        default:
          tags.push("business");
      }
    });
    return tags;
  }

  private generateBusinessValueFromGoals(goals: ProjectGoal[]): string {
    if (goals.length === 0) return "Supports user experience improvement";

    const highPriorityGoals = goals.filter((g) => g.priority === "high");
    if (highPriorityGoals.length > 0) {
      return `Directly enables: ${highPriorityGoals.map((g) => g.description).join(", ")}`;
    }

    return `Supports: ${goals.map((g) => g.description).join(", ")}`;
  }

  private generateEpicGoalFromStories(
    _stories: UserStory[],
    theme: string,
  ): string {
    return `Deliver comprehensive ${theme.toLowerCase()} capabilities`;
  }

  private determineEpicPriority(
    stories: UserStory[],
  ): "high" | "medium" | "low" {
    const highPriorityStories = stories.filter((s) => s.priority === "high");
    if (highPriorityStories.length > stories.length / 2) return "high";

    const mediumPriorityStories = stories.filter(
      (s) => s.priority === "medium",
    );
    if (mediumPriorityStories.length > stories.length / 2) return "medium";

    return "low";
  }

  private estimateEpicEffort(
    stories: UserStory[],
  ): "small" | "medium" | "large" | "extra-large" {
    const totalStories = stories.length;
    if (totalStories <= 3) return "small";
    if (totalStories <= 7) return "medium";
    if (totalStories <= 12) return "large";
    return "extra-large";
  }

  private generateSuccessMetrics(goals: ProjectGoal[]): string[] {
    const metrics: string[] = [];
    goals.forEach((goal) => {
      if (goal.metrics) {
        metrics.push(...goal.metrics);
      } else if (goal.measurable) {
        metrics.push(`${goal.description} completion rate`);
      }
    });
    return metrics.length > 0 ? metrics : ["User satisfaction improvement"];
  }

  private findRelevantAssumptions(
    assumptions: Assumption[],
    goalIds: string[],
  ): string[] {
    return assumptions
      .filter((assumption) =>
        assumption.extractedFrom.some((messageId) =>
          goalIds.some((goalId) => messageId.includes(goalId)),
        ),
      )
      .map((a) => a.id);
  }

  private findRelatedContexts(
    persona: UserPersona,
    goal: ProjectGoal,
    contexts: BusinessContext[],
  ): BusinessContext[] {
    return contexts.filter(
      (context) =>
        context.extractedFrom.some((messageId) =>
          persona.extractedFrom.includes(messageId),
        ) ||
        context.extractedFrom.some((messageId) =>
          goal.extractedFrom.includes(messageId),
        ),
    );
  }

  private findRelatedConstraints(
    persona: UserPersona,
    goal: ProjectGoal,
    constraints: Constraint[],
  ): Constraint[] {
    return constraints.filter(
      (constraint) =>
        constraint.extractedFrom.some((messageId) =>
          persona.extractedFrom.includes(messageId),
        ) ||
        constraint.extractedFrom.some((messageId) =>
          goal.extractedFrom.includes(messageId),
        ),
    );
  }

  private deduplicateStories(stories: UserStory[]): UserStory[] {
    const seen = new Set<string>();
    return stories.filter((story) => {
      const key = `${story.asA}-${story.iWant}-${story.soThat}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private prioritizeEpics(epics: Epic[]): Epic[] {
    return epics.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];

      if (aPriority !== bPriority) return bPriority - aPriority;

      // Secondary sort by number of stories (more stories = higher priority)
      return b.userStories.length - a.userStories.length;
    });
  }

  private generateNotes(
    stories: UserStory[],
    epics: Epic[],
    extractedInfo: ExtractedInformation,
  ): string[] {
    const notes: string[] = [];

    notes.push(
      `Generated ${stories.length} user stories from ${extractedInfo.personas.length} personas and ${extractedInfo.goals.length} goals`,
    );
    notes.push(`Created ${epics.length} epics to organize the stories`);

    if (extractedInfo.assumptions.length > 0) {
      notes.push(
        `Consider validating ${extractedInfo.assumptions.length} assumptions before implementation`,
      );
    }

    const highPriorityStories = stories.filter((s) => s.priority === "high");
    if (highPriorityStories.length > 0) {
      notes.push(
        `${highPriorityStories.length} high-priority stories identified for immediate attention`,
      );
    }

    return notes;
  }
}

export const storyEpicGenerationService =
  StoryEpicGenerationService.getInstance();
