import {
  InformationGatheringQuestion,
  QuestionGenerationContext,
  ExtractedInformation,
  EnhancedProposalMessage,
} from "../types/enhanced-proposals";

export class QuestionGenerationService {
  private static instance: QuestionGenerationService;

  public static getInstance(): QuestionGenerationService {
    if (!QuestionGenerationService.instance) {
      QuestionGenerationService.instance = new QuestionGenerationService();
    }
    return QuestionGenerationService.instance;
  }

  private questionBank: InformationGatheringQuestion[] = [
    // Persona Questions
    {
      id: "persona-1",
      category: "persona",
      question:
        "Who are the primary users or stakeholders who will be affected by this proposal?",
      followUpQuestions: [
        "What are their main responsibilities in their current role?",
        "What challenges do they face in their daily work?",
      ],
      priority: 10,
      prerequisiteCategories: [],
    },
    {
      id: "persona-2",
      category: "persona",
      question:
        "What specific pain points or frustrations do these users experience with the current situation?",
      followUpQuestions: [
        "How do these pain points impact their productivity?",
        "Have they tried to solve these problems before?",
      ],
      priority: 9,
      prerequisiteCategories: ["persona"],
    },
    {
      id: "persona-3",
      category: "persona",
      question:
        "What would success look like from each user group's perspective?",
      followUpQuestions: [
        "How would they measure improvement?",
        "What would make them advocate for this solution?",
      ],
      priority: 8,
      prerequisiteCategories: ["persona"],
    },
    {
      id: "persona-4",
      category: "persona",
      question:
        "How do these different user types interact with each other in their workflow?",
      followUpQuestions: [
        "Are there any conflicts or competing priorities between user groups?",
        "How do communication patterns affect their work?",
      ],
      priority: 7,
      prerequisiteCategories: ["persona"],
    },

    // Context Questions
    {
      id: "context-1",
      category: "context",
      question:
        "What's the current business context or situation that's driving this need?",
      followUpQuestions: [
        "Are there any recent changes in the market or industry?",
        "What competitive pressures are you facing?",
      ],
      priority: 9,
      prerequisiteCategories: [],
    },
    {
      id: "context-2",
      category: "context",
      question:
        "What systems, processes, or technologies are currently in place?",
      followUpQuestions: [
        "What's working well with the current setup?",
        "What's causing the most friction or inefficiency?",
      ],
      priority: 8,
      prerequisiteCategories: [],
    },
    {
      id: "context-3",
      category: "context",
      question:
        "Are there any regulatory, compliance, or organizational constraints we need to consider?",
      followUpQuestions: [
        "What approval processes will this need to go through?",
        "Are there any industry standards or regulations that apply?",
      ],
      priority: 7,
      prerequisiteCategories: ["context"],
    },
    {
      id: "context-4",
      category: "context",
      question:
        "How does this initiative align with your organization's strategic priorities?",
      followUpQuestions: [
        "What other initiatives might this impact or depend on?",
        "How does this fit into the broader digital transformation strategy?",
      ],
      priority: 6,
      prerequisiteCategories: ["context"],
    },

    // Goals Questions
    {
      id: "goals-1",
      category: "goals",
      question:
        "What are the primary business outcomes you're hoping to achieve?",
      followUpQuestions: [
        "How will you measure success?",
        "What metrics or KPIs are most important?",
      ],
      priority: 10,
      prerequisiteCategories: ["context"],
    },
    {
      id: "goals-2",
      category: "goals",
      question: "Are there any secondary benefits or nice-to-have outcomes?",
      followUpQuestions: [
        "What unexpected benefits might emerge?",
        "How might this enable future opportunities?",
      ],
      priority: 6,
      prerequisiteCategories: ["goals"],
    },
    {
      id: "goals-3",
      category: "goals",
      question:
        "What timeline are you working with, and are there any key milestones or deadlines?",
      followUpQuestions: [
        "What happens if we miss the deadline?",
        "Are there any external factors driving the timeline?",
      ],
      priority: 8,
      prerequisiteCategories: ["goals"],
    },
    {
      id: "goals-4",
      category: "goals",
      question:
        "How will you know if the solution is working as intended after implementation?",
      followUpQuestions: [
        "What early indicators of success should we track?",
        "How often will progress be reviewed and by whom?",
      ],
      priority: 7,
      prerequisiteCategories: ["goals"],
    },

    // Constraints Questions
    {
      id: "constraints-1",
      category: "constraints",
      question: "What budget range are you working with for this initiative?",
      followUpQuestions: [
        "Is this a one-time investment or ongoing expense?",
        "What's the cost of not solving this problem?",
      ],
      priority: 8,
      prerequisiteCategories: ["goals"],
    },
    {
      id: "constraints-2",
      category: "constraints",
      question:
        "What resources (people, time, expertise) are available for this project?",
      followUpQuestions: [
        "Who would be the key stakeholders or decision makers?",
        "What skills might you need to acquire or hire for?",
      ],
      priority: 7,
      prerequisiteCategories: ["constraints"],
    },
    {
      id: "constraints-3",
      category: "constraints",
      question:
        "Are there any technical limitations or integration requirements we should be aware of?",
      followUpQuestions: [
        "What systems need to work together?",
        "Are there any legacy systems that can't be changed?",
      ],
      priority: 6,
      prerequisiteCategories: ["context", "constraints"],
    },
    {
      id: "constraints-4",
      category: "constraints",
      question:
        "What organizational or political factors might impact this project?",
      followUpQuestions: [
        "Are there any departments or individuals who might resist change?",
        "What change management considerations are important?",
      ],
      priority: 5,
      prerequisiteCategories: ["persona", "constraints"],
    },

    // Assumptions Questions
    {
      id: "assumptions-1",
      category: "assumptions",
      question:
        "What assumptions are you making about user adoption or behavior change?",
      followUpQuestions: [
        "How willing are users to change their current workflow?",
        "What might resistance look like?",
      ],
      priority: 7,
      prerequisiteCategories: ["persona", "goals"],
    },
    {
      id: "assumptions-2",
      category: "assumptions",
      question:
        "What do you assume about the technical feasibility or complexity?",
      followUpQuestions: [
        "What could make this more complex than expected?",
        "Are there any unknowns that could emerge during implementation?",
      ],
      priority: 6,
      prerequisiteCategories: ["context", "goals"],
    },
    {
      id: "assumptions-3",
      category: "assumptions",
      question:
        "What assumptions are you making about market conditions or external factors?",
      followUpQuestions: [
        "How might market changes affect this project?",
        "What external dependencies are you assuming will remain stable?",
      ],
      priority: 5,
      prerequisiteCategories: ["context", "assumptions"],
    },

    // Validation Questions
    {
      id: "validation-1",
      category: "validation",
      question:
        "How will you validate that this solution actually solves the problem?",
      followUpQuestions: [
        "What would early indicators of success look like?",
        "How will you measure impact over time?",
      ],
      priority: 5,
      prerequisiteCategories: ["goals", "assumptions"],
    },
    {
      id: "validation-2",
      category: "validation",
      question:
        "What could go wrong, and how would you know early if the project is off track?",
      followUpQuestions: [
        "What warning signs should we watch for?",
        "How will you course-correct if needed?",
      ],
      priority: 4,
      prerequisiteCategories: ["constraints", "assumptions"],
    },
    {
      id: "validation-3",
      category: "validation",
      question: "How will you test key assumptions before full implementation?",
      followUpQuestions: [
        "What pilot programs or proof-of-concepts make sense?",
        "How will you gather feedback from users during development?",
      ],
      priority: 4,
      prerequisiteCategories: ["assumptions", "persona"],
    },
  ];

  /**
   * Generate the next most relevant question based on the current context
   */
  public generateNextQuestion(
    context: QuestionGenerationContext,
  ): InformationGatheringQuestion | null {
    const availableQuestions = this.getAvailableQuestions(context);

    if (availableQuestions.length === 0) {
      return null; // No more questions available
    }

    // Sort by priority and return the highest priority question
    availableQuestions.sort((a, b) => b.priority - a.priority);
    return availableQuestions[0];
  }

  /**
   * Generate a smart question based on what's missing or incomplete
   */
  public generateSmartQuestion(context: QuestionGenerationContext): string {
    const { existingInformation, missingInformation, conversationHistory } =
      context;

    // Analyze what information is most urgently needed
    const urgentNeeds = this.analyzeUrgentNeeds(
      existingInformation,
      missingInformation,
    );

    if (urgentNeeds.length > 0) {
      return this.craftContextualQuestion(urgentNeeds[0], conversationHistory);
    }

    // Fall back to a general exploration question
    return this.generateExploratoryQuestion(existingInformation);
  }

  /**
   * Get all questions that are currently relevant and haven't been addressed
   */
  private getAvailableQuestions(
    context: QuestionGenerationContext,
  ): InformationGatheringQuestion[] {
    const { existingInformation, conversationHistory, missingInformation } =
      context;

    return this.questionBank.filter((question) => {
      // Check if prerequisites are met
      const prerequisitesMet = this.arePrerequisitesMet(
        question,
        existingInformation,
      );

      // Check if this category still needs information
      const categoryNeeded = this.isCategoryNeeded(
        question.category,
        existingInformation,
        missingInformation,
      );

      // Check if similar question hasn't been asked recently
      const notRecentlyAsked = !this.wasRecentlyAsked(
        question,
        conversationHistory,
      );

      return prerequisitesMet && categoryNeeded && notRecentlyAsked;
    });
  }

  /**
   * Check if the prerequisites for a question are met
   */
  private arePrerequisitesMet(
    question: InformationGatheringQuestion,
    info: ExtractedInformation,
  ): boolean {
    if (
      !question.prerequisiteCategories ||
      question.prerequisiteCategories.length === 0
    ) {
      return true;
    }

    return question.prerequisiteCategories.every((category) => {
      switch (category) {
        case "persona":
          return info.personas.length > 0;
        case "context":
          return info.contexts.length > 0;
        case "goals":
          return info.goals.length > 0;
        case "constraints":
          return info.constraints.length > 0;
        case "assumptions":
          return info.assumptions.length > 0;
        default:
          return true;
      }
    });
  }

  /**
   * Check if a category still needs more information
   */
  private isCategoryNeeded(
    category: InformationGatheringQuestion["category"],
    info: ExtractedInformation,
    missingInfo: string[],
  ): boolean {
    // Check if this category is explicitly listed as missing
    if (missingInfo.includes(category)) {
      return true;
    }

    // Check minimum thresholds for each category
    switch (category) {
      case "persona":
        return info.personas.length < 2; // Need at least 2 personas
      case "context":
        return info.contexts.length < 3; // Need at least 3 context items
      case "goals":
        return info.goals.length < 2; // Need at least 2 goals
      case "constraints":
        return info.constraints.length < 2; // Need at least 2 constraints
      case "assumptions":
        return info.assumptions.length < 2; // Need at least 2 assumptions
      case "validation":
        return info.goals.length > 0 && info.assumptions.length > 0; // Only if we have goals and assumptions
      default:
        return false;
    }
  }

  /**
   * Check if a similar question was asked recently
   */
  private wasRecentlyAsked(
    question: InformationGatheringQuestion,
    history: EnhancedProposalMessage[],
  ): boolean {
    const recentMessages = history.slice(-6); // Check last 6 messages

    return recentMessages.some(
      (message) =>
        !message.isUser && message.questionCategory === question.category,
    );
  }

  /**
   * Generate a contextual follow-up question
   */
  public generateFollowUp(
    originalQuestion: InformationGatheringQuestion,
    userResponse: string,
  ): string | null {
    if (
      !originalQuestion.followUpQuestions ||
      originalQuestion.followUpQuestions.length === 0
    ) {
      return null;
    }

    // Analyze response to pick the most relevant follow-up
    const responseAnalysis = this.analyzeResponse(userResponse);

    if (responseAnalysis.needsMoreDetail) {
      return originalQuestion.followUpQuestions[0];
    } else if (
      responseAnalysis.isDetailed &&
      originalQuestion.followUpQuestions.length > 1
    ) {
      return originalQuestion.followUpQuestions[1];
    }

    return originalQuestion.followUpQuestions[0];
  }

  /**
   * Determine if we have enough information to move to the next phase
   */
  public assessReadinessForNextPhase(info: ExtractedInformation): {
    ready: boolean;
    completionPercentage: number;
    missingCategories: string[];
  } {
    const requirements = {
      personas: { min: 2, actual: info.personas.length },
      contexts: { min: 3, actual: info.contexts.length },
      goals: { min: 2, actual: info.goals.length },
      constraints: { min: 2, actual: info.constraints.length },
      assumptions: { min: 1, actual: info.assumptions.length },
    };

    let totalScore = 0;
    let maxScore = 0;
    const missingCategories: string[] = [];

    Object.entries(requirements).forEach(([category, { min, actual }]) => {
      const score = Math.min(actual, min);
      totalScore += score;
      maxScore += min;

      if (actual < min) {
        missingCategories.push(category);
      }
    });

    const completionPercentage = Math.round((totalScore / maxScore) * 100);
    const ready = completionPercentage >= 80; // 80% threshold

    return {
      ready,
      completionPercentage,
      missingCategories,
    };
  }

  /**
   * Analyze what information is most urgently needed
   */
  private analyzeUrgentNeeds(
    info: ExtractedInformation,
    _missing: string[],
  ): string[] {
    const urgentNeeds: string[] = [];

    // Prioritize based on dependencies and completeness
    if (info.personas.length === 0) urgentNeeds.push("persona");
    if (info.contexts.length === 0) urgentNeeds.push("context");
    if (info.goals.length === 0 && info.personas.length > 0)
      urgentNeeds.push("goals");
    if (info.constraints.length === 0 && info.goals.length > 0)
      urgentNeeds.push("constraints");
    if (info.assumptions.length === 0 && info.goals.length > 1)
      urgentNeeds.push("assumptions");

    return urgentNeeds;
  }

  /**
   * Craft a contextual question based on urgent needs
   */
  private craftContextualQuestion(
    need: string,
    history: EnhancedProposalMessage[],
  ): string {
    const recentUserMessages = history
      .filter((m: EnhancedProposalMessage) => m.isUser)
      .slice(-3);
    const context = recentUserMessages
      .map((m: EnhancedProposalMessage) => m.content.toLowerCase())
      .join(" ");

    const contextualQuestions: Record<string, string[]> = {
      persona: [
        "I'd like to understand the people side better. Who would be most impacted by what you're describing?",
        "Let's talk about the users. Can you walk me through who would interact with this solution?",
        "To make sure we're building something people actually want - who are we building this for?",
      ],
      context: [
        "Help me understand the bigger picture. What's the current situation that's driving this need?",
        "I want to make sure I understand the environment. What's happening in your organization right now?",
        "Let's zoom out a bit. What context should I know about your business or industry?",
      ],
      goals: [
        "Now that I understand the situation, what outcomes are you hoping to achieve?",
        "What would success look like if we could solve this perfectly?",
        "Let's get specific about goals. What would make this project a win?",
      ],
      constraints: [
        "Let's talk about reality. What constraints or limitations do we need to work within?",
        "Every project has boundaries. What are the key constraints we should consider?",
        "What might limit or restrict our approach here?",
      ],
      assumptions: [
        "I want to surface some assumptions. What are you taking for granted about this project?",
        "Let's identify some assumptions that might be worth validating. What do you think is true but haven't verified?",
        "What beliefs or expectations do you have that we should examine more closely?",
      ],
    };

    const questions = contextualQuestions[need] || [];

    // Use context to pick the most relevant question
    if (questions.length > 1 && context.length > 0) {
      // Simple contextual selection - if context mentions certain keywords,
      // prioritize questions that might be more relevant
      if (
        context.includes("user") ||
        context.includes("people") ||
        context.includes("customer")
      ) {
        return questions[0]; // First question is usually about people/users
      }
      if (
        context.includes("business") ||
        context.includes("organization") ||
        context.includes("company")
      ) {
        return questions[1] || questions[0]; // Second question about business context
      }
    }

    return (
      questions[Math.floor(Math.random() * questions.length)] ||
      `Tell me more about ${need}.`
    );
  }

  /**
   * Generate an exploratory question when no urgent needs exist
   */
  private generateExploratoryQuestion(_info: ExtractedInformation): string {
    const exploratoryQuestions = [
      "What aspect of this project are you most excited about?",
      "What keeps you up at night when you think about this initiative?",
      "If you could wave a magic wand and make one thing perfect about this project, what would it be?",
      "What would happen if you did nothing and maintained the status quo?",
      "Who else should I talk to understand this problem better?",
    ];

    return exploratoryQuestions[
      Math.floor(Math.random() * exploratoryQuestions.length)
    ];
  }

  /**
   * Analyze user response to determine follow-up strategy
   */
  private analyzeResponse(response: string): {
    needsMoreDetail: boolean;
    isDetailed: boolean;
  } {
    const wordCount = response.split(/\s+/).length;
    const hasSpecifics =
      /\b(specifically|exactly|particularly|for example|such as|including)\b/i.test(
        response,
      );

    return {
      needsMoreDetail: wordCount < 15 || !hasSpecifics,
      isDetailed: wordCount > 50 && hasSpecifics,
    };
  }

  /**
   * Generate phase transition message
   */
  public generatePhaseTransitionMessage(
    completionPercentage: number,
    missingCategories: string[],
  ): string {
    if (completionPercentage >= 80) {
      return `Great! I think we have enough information to start forming some concrete stories and epics. We've covered the key areas: personas, context, goals, and constraints. Let's move to the next phase where I'll help you structure this into actionable user stories.`;
    }

    const missing = missingCategories.join(", ");
    return `We're making good progress (${completionPercentage}% complete)! I'd like to gather a bit more information about ${missing} before we move to story formation. This will help ensure we create the most relevant and actionable user stories.`;
  }
}

export const questionGenerationService =
  QuestionGenerationService.getInstance();
