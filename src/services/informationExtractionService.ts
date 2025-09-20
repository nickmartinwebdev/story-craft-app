import {
  ExtractedInformation,
  UserPersona,
  BusinessContext,
  ProjectGoal,
  Constraint,
  Assumption,
  EnhancedProposalMessage,
  InformationExtractionResult,
} from "../types/enhanced-proposals";

export class InformationExtractionService {
  private static instance: InformationExtractionService;

  public static getInstance(): InformationExtractionService {
    if (!InformationExtractionService.instance) {
      InformationExtractionService.instance =
        new InformationExtractionService();
    }
    return InformationExtractionService.instance;
  }

  /**
   * Extract structured information from a conversation message
   */
  public extractInformationFromMessage(
    message: EnhancedProposalMessage,
    existingInfo: ExtractedInformation,
  ): InformationExtractionResult {
    const content = message.content.toLowerCase();
    const extracted: Partial<ExtractedInformation> = {};
    let totalConfidence = 0;
    let extractionCount = 0;

    // Extract personas
    const personas = this.extractPersonas(content, message.id);
    if (personas.length > 0) {
      extracted.personas = this.mergePersonas(existingInfo.personas, personas);
      totalConfidence += 0.8;
      extractionCount++;
    }

    // Extract business contexts
    const contexts = this.extractContexts(content, message.id);
    if (contexts.length > 0) {
      extracted.contexts = this.mergeContexts(existingInfo.contexts, contexts);
      totalConfidence += 0.7;
      extractionCount++;
    }

    // Extract goals
    const goals = this.extractGoals(content, message.id);
    if (goals.length > 0) {
      extracted.goals = this.mergeGoals(existingInfo.goals, goals);
      totalConfidence += 0.9;
      extractionCount++;
    }

    // Extract constraints
    const constraints = this.extractConstraints(content, message.id);
    if (constraints.length > 0) {
      extracted.constraints = this.mergeConstraints(
        existingInfo.constraints,
        constraints,
      );
      totalConfidence += 0.8;
      extractionCount++;
    }

    // Extract assumptions
    const assumptions = this.extractAssumptions(content, message.id);
    if (assumptions.length > 0) {
      extracted.assumptions = this.mergeAssumptions(
        existingInfo.assumptions,
        assumptions,
      );
      totalConfidence += 0.6;
      extractionCount++;
    }

    const confidence =
      extractionCount > 0 ? totalConfidence / extractionCount : 0;
    const suggestedQuestions = this.generateSuggestedQuestions(extracted);

    return {
      extracted,
      confidence,
      suggestedQuestions,
    };
  }

  private extractPersonas(content: string, messageId: string): UserPersona[] {
    const personas: UserPersona[] = [];
    const personaPatterns = [
      { keywords: ["user", "end user", "customer"], role: "End User" },
      {
        keywords: ["admin", "administrator", "system admin"],
        role: "Administrator",
      },
      {
        keywords: ["manager", "project manager", "team lead"],
        role: "Manager",
      },
      { keywords: ["developer", "engineer", "programmer"], role: "Developer" },
      {
        keywords: ["stakeholder", "business owner", "product owner"],
        role: "Stakeholder",
      },
      {
        keywords: ["analyst", "business analyst", "data analyst"],
        role: "Analyst",
      },
      { keywords: ["client", "customer", "buyer"], role: "Client" },
      { keywords: ["employee", "staff", "team member"], role: "Employee" },
    ];

    personaPatterns.forEach((pattern) => {
      pattern.keywords.forEach((keyword) => {
        if (content.includes(keyword)) {
          const sentences = this.extractSentencesContaining(content, keyword);
          if (sentences.length > 0) {
            const persona: UserPersona = {
              id: `persona-${Date.now()}-${keyword.replace(/\s+/g, "-")}`,
              name: pattern.role,
              role: pattern.role,
              description:
                sentences[0] || `${pattern.role} mentioned in conversation`,
              painPoints: this.extractPainPoints(sentences.join(" ")),
              goals: this.extractPersonaGoals(sentences.join(" ")),
              behaviors: this.extractBehaviors(sentences.join(" ")),
              extractedFrom: [messageId],
            };
            personas.push(persona);
          }
        }
      });
    });

    return personas;
  }

  private extractContexts(
    content: string,
    messageId: string,
  ): BusinessContext[] {
    const contexts: BusinessContext[] = [];
    const contextPatterns = [
      {
        keywords: [
          "market",
          "competition",
          "industry",
          "competitive landscape",
          "market share",
        ],
        category: "market" as const,
        title: "Market Context",
      },
      {
        keywords: [
          "technology",
          "system",
          "platform",
          "tech stack",
          "infrastructure",
          "software",
        ],
        category: "technology" as const,
        title: "Technology Context",
      },
      {
        keywords: [
          "organization",
          "company",
          "team",
          "department",
          "organizational structure",
        ],
        category: "organizational" as const,
        title: "Organizational Context",
      },
      {
        keywords: [
          "regulation",
          "compliance",
          "legal",
          "policy",
          "governance",
          "audit",
        ],
        category: "regulatory" as const,
        title: "Regulatory Context",
      },
      {
        keywords: ["competitor", "rival", "alternative", "competing solution"],
        category: "competitive" as const,
        title: "Competitive Context",
      },
    ];

    contextPatterns.forEach((pattern) => {
      pattern.keywords.forEach((keyword) => {
        if (content.includes(keyword)) {
          const sentences = this.extractSentencesContaining(content, keyword);
          if (sentences.length > 0) {
            const context: BusinessContext = {
              id: `context-${Date.now()}-${keyword.replace(/\s+/g, "-")}`,
              category: pattern.category,
              title: pattern.title,
              description:
                sentences[0] || `${keyword} context mentioned in conversation`,
              impact: this.determineImpact(sentences.join(" ")),
              extractedFrom: [messageId],
            };
            contexts.push(context);
          }
        }
      });
    });

    return contexts;
  }

  private extractGoals(content: string, messageId: string): ProjectGoal[] {
    const goals: ProjectGoal[] = [];
    const goalPatterns = [
      {
        keywords: ["goal", "objective", "aim", "target"],
        type: "business" as const,
      },
      {
        keywords: ["achieve", "accomplish", "reach", "attain"],
        type: "business" as const,
      },
      {
        keywords: ["improve", "enhance", "optimize", "increase"],
        type: "operational" as const,
      },
      {
        keywords: ["reduce", "decrease", "minimize", "eliminate"],
        type: "operational" as const,
      },
      {
        keywords: ["user experience", "customer satisfaction", "usability"],
        type: "user" as const,
      },
      {
        keywords: ["performance", "scalability", "reliability", "security"],
        type: "technical" as const,
      },
    ];

    goalPatterns.forEach((pattern) => {
      pattern.keywords.forEach((keyword) => {
        if (content.includes(keyword)) {
          const sentences = this.extractSentencesContaining(content, keyword);
          if (sentences.length > 0) {
            const goal: ProjectGoal = {
              id: `goal-${Date.now()}-${keyword.replace(/\s+/g, "-")}`,
              type: this.determineGoalType(sentences.join(" "), pattern.type),
              description: sentences[0] || `${keyword} mentioned as goal`,
              priority: this.determinePriority(sentences.join(" ")),
              measurable: this.isMeasurable(sentences.join(" ")),
              metrics: this.extractMetrics(sentences.join(" ")),
              extractedFrom: [messageId],
            };
            goals.push(goal);
          }
        }
      });
    });

    return goals;
  }

  private extractConstraints(content: string, messageId: string): Constraint[] {
    const constraints: Constraint[] = [];
    const constraintPatterns = [
      {
        keywords: [
          "budget",
          "cost",
          "expensive",
          "cheap",
          "funding",
          "financial",
        ],
        type: "budget" as const,
      },
      {
        keywords: [
          "timeline",
          "deadline",
          "schedule",
          "time constraint",
          "urgent",
        ],
        type: "timeline" as const,
      },
      {
        keywords: [
          "technical limitation",
          "system constraint",
          "technology limit",
        ],
        type: "technical" as const,
      },
      {
        keywords: ["regulation", "compliance requirement", "legal constraint"],
        type: "regulatory" as const,
      },
      {
        keywords: ["resource", "staff", "people", "team size", "capacity"],
        type: "resource" as const,
      },
    ];

    constraintPatterns.forEach((pattern) => {
      pattern.keywords.forEach((keyword) => {
        if (content.includes(keyword)) {
          const sentences = this.extractSentencesContaining(content, keyword);
          if (sentences.length > 0) {
            const constraint: Constraint = {
              id: `constraint-${Date.now()}-${keyword.replace(/\s+/g, "-")}`,
              type: pattern.type,
              description: sentences[0] || `${keyword} constraint mentioned`,
              severity: this.determineSeverity(sentences.join(" ")),
              extractedFrom: [messageId],
            };
            constraints.push(constraint);
          }
        }
      });
    });

    return constraints;
  }

  private extractAssumptions(content: string, messageId: string): Assumption[] {
    const assumptions: Assumption[] = [];
    const assumptionKeywords = [
      "assume",
      "assumption",
      "expect",
      "believe",
      "think",
      "probably",
      "likely",
      "suppose",
      "presume",
      "anticipate",
    ];

    assumptionKeywords.forEach((keyword) => {
      if (content.includes(keyword)) {
        const sentences = this.extractSentencesContaining(content, keyword);
        if (sentences.length > 0) {
          const assumption: Assumption = {
            id: `assumption-${Date.now()}-${keyword}`,
            category: this.determineAssumptionCategory(sentences.join(" ")),
            description: sentences[0] || `${keyword} assumption mentioned`,
            confidence: this.determineConfidence(sentences.join(" ")),
            needsValidation: this.needsValidation(sentences.join(" ")),
            extractedFrom: [messageId],
          };
          assumptions.push(assumption);
        }
      }
    });

    return assumptions;
  }

  // Helper methods for text analysis
  private extractSentencesContaining(text: string, keyword: string): string[] {
    const sentences = text.split(/[.!?]+/);
    return sentences
      .filter((sentence) =>
        sentence.toLowerCase().includes(keyword.toLowerCase()),
      )
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 10); // Filter out very short sentences
  }

  private extractPainPoints(text: string): string[] {
    const painKeywords = [
      "problem",
      "issue",
      "challenge",
      "difficulty",
      "struggle",
      "frustration",
      "bottleneck",
    ];
    const painPoints: string[] = [];

    painKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        const sentences = this.extractSentencesContaining(text, keyword);
        painPoints.push(
          ...sentences.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
        );
      }
    });

    return [...new Set(painPoints)]; // Remove duplicates
  }

  private extractPersonaGoals(text: string): string[] {
    const goalKeywords = [
      "want",
      "need",
      "goal",
      "achieve",
      "improve",
      "succeed",
    ];
    const goals: string[] = [];

    goalKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        goals.push(`Wants to ${keyword}`);
      }
    });

    return [...new Set(goals)];
  }

  private extractBehaviors(text: string): string[] {
    const behaviorKeywords = [
      "use",
      "prefer",
      "avoid",
      "typically",
      "usually",
      "always",
      "never",
    ];
    const behaviors: string[] = [];

    behaviorKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        behaviors.push(`${keyword} behavior pattern identified`);
      }
    });

    return [...new Set(behaviors)];
  }

  private determineImpact(text: string): "high" | "medium" | "low" {
    const highImpact = [
      "critical",
      "crucial",
      "essential",
      "vital",
      "must have",
    ];
    const mediumImpact = ["important", "significant", "major", "should have"];

    if (highImpact.some((keyword) => text.includes(keyword))) return "high";
    if (mediumImpact.some((keyword) => text.includes(keyword))) return "medium";
    return "low";
  }

  private determineGoalType(
    text: string,
    defaultType: "business" | "user" | "technical" | "operational",
  ): "business" | "user" | "technical" | "operational" {
    if (
      text.includes("revenue") ||
      text.includes("profit") ||
      text.includes("business")
    )
      return "business";
    if (
      text.includes("user") ||
      text.includes("customer") ||
      text.includes("experience")
    )
      return "user";
    if (
      text.includes("system") ||
      text.includes("technical") ||
      text.includes("performance")
    )
      return "technical";
    return defaultType;
  }

  private determinePriority(text: string): "high" | "medium" | "low" {
    const highPriority = [
      "critical",
      "urgent",
      "must",
      "required",
      "essential",
    ];
    const mediumPriority = ["important", "should", "significant", "moderate"];

    if (highPriority.some((keyword) => text.includes(keyword))) return "high";
    if (mediumPriority.some((keyword) => text.includes(keyword)))
      return "medium";
    return "low";
  }

  private isMeasurable(text: string): boolean {
    const measurableKeywords = [
      "%",
      "percent",
      "number",
      "count",
      "metric",
      "kpi",
      "measure",
      "track",
      "quantify",
    ];
    return measurableKeywords.some((keyword) => text.includes(keyword));
  }

  private extractMetrics(text: string): string[] {
    const metricKeywords = [
      "conversion",
      "engagement",
      "performance",
      "efficiency",
      "satisfaction",
      "retention",
      "growth",
    ];
    return metricKeywords.filter((keyword) => text.includes(keyword));
  }

  private determineSeverity(text: string): "critical" | "important" | "minor" {
    const critical = ["critical", "must", "required", "blocking"];
    const important = ["important", "should", "significant"];

    if (critical.some((keyword) => text.includes(keyword))) return "critical";
    if (important.some((keyword) => text.includes(keyword))) return "important";
    return "minor";
  }

  private determineAssumptionCategory(
    text: string,
  ): "business" | "technical" | "user" | "market" {
    if (
      text.includes("business") ||
      text.includes("revenue") ||
      text.includes("profit")
    )
      return "business";
    if (
      text.includes("technical") ||
      text.includes("system") ||
      text.includes("technology")
    )
      return "technical";
    if (
      text.includes("user") ||
      text.includes("customer") ||
      text.includes("behavior")
    )
      return "user";
    return "market";
  }

  private determineConfidence(text: string): "high" | "medium" | "low" {
    const highConfidence = ["certain", "sure", "confident", "definite"];
    const mediumConfidence = ["likely", "probably", "expect"];

    if (highConfidence.some((keyword) => text.includes(keyword))) return "high";
    if (mediumConfidence.some((keyword) => text.includes(keyword)))
      return "medium";
    return "low";
  }

  private needsValidation(text: string): boolean {
    const validationKeywords = [
      "verify",
      "confirm",
      "validate",
      "check",
      "uncertain",
      "unclear",
      "assumption",
    ];
    return validationKeywords.some((keyword) => text.includes(keyword));
  }

  private generateSuggestedQuestions(
    extracted: Partial<ExtractedInformation>,
  ): string[] {
    const questions: string[] = [];

    if (extracted.personas && extracted.personas.length > 0) {
      questions.push(
        "Can you tell me more about the specific challenges these users face?",
      );
    }

    if (extracted.goals && extracted.goals.length > 0) {
      questions.push("How will you measure success for these objectives?");
    }

    if (extracted.constraints && extracted.constraints.length > 0) {
      questions.push(
        "Are there any workarounds or alternatives we should consider for these constraints?",
      );
    }

    if (extracted.assumptions && extracted.assumptions.length > 0) {
      questions.push(
        "How might we validate these assumptions before proceeding?",
      );
    }

    return questions;
  }

  // Merge methods to avoid duplicates and enhance existing information
  private mergePersonas(
    existing: UserPersona[],
    newPersonas: UserPersona[],
  ): UserPersona[] {
    const merged = [...existing];

    newPersonas.forEach((newPersona) => {
      const existingIndex = merged.findIndex(
        (p) =>
          p.name.toLowerCase() === newPersona.name.toLowerCase() ||
          p.role.toLowerCase() === newPersona.role.toLowerCase(),
      );

      if (existingIndex >= 0) {
        // Merge with existing persona
        merged[existingIndex] = {
          ...merged[existingIndex],
          description:
            merged[existingIndex].description || newPersona.description,
          painPoints: [
            ...new Set([
              ...merged[existingIndex].painPoints,
              ...newPersona.painPoints,
            ]),
          ],
          goals: [
            ...new Set([...merged[existingIndex].goals, ...newPersona.goals]),
          ],
          behaviors: [
            ...new Set([
              ...merged[existingIndex].behaviors,
              ...newPersona.behaviors,
            ]),
          ],
          extractedFrom: [
            ...new Set([
              ...merged[existingIndex].extractedFrom,
              ...newPersona.extractedFrom,
            ]),
          ],
        };
      } else {
        merged.push(newPersona);
      }
    });

    return merged;
  }

  private mergeContexts(
    existing: BusinessContext[],
    newContexts: BusinessContext[],
  ): BusinessContext[] {
    const merged = [...existing];

    newContexts.forEach((newContext) => {
      const existingIndex = merged.findIndex(
        (c) =>
          c.category === newContext.category &&
          c.title.toLowerCase().includes(newContext.title.toLowerCase()),
      );

      if (existingIndex >= 0) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          extractedFrom: [
            ...new Set([
              ...merged[existingIndex].extractedFrom,
              ...newContext.extractedFrom,
            ]),
          ],
        };
      } else {
        merged.push(newContext);
      }
    });

    return merged;
  }

  private mergeGoals(
    existing: ProjectGoal[],
    newGoals: ProjectGoal[],
  ): ProjectGoal[] {
    const merged = [...existing];

    newGoals.forEach((newGoal) => {
      const existingIndex = merged.findIndex((g) =>
        g.description
          .toLowerCase()
          .includes(newGoal.description.toLowerCase().slice(0, 20)),
      );

      if (existingIndex >= 0) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          extractedFrom: [
            ...new Set([
              ...merged[existingIndex].extractedFrom,
              ...newGoal.extractedFrom,
            ]),
          ],
        };
      } else {
        merged.push(newGoal);
      }
    });

    return merged;
  }

  private mergeConstraints(
    existing: Constraint[],
    newConstraints: Constraint[],
  ): Constraint[] {
    const merged = [...existing];

    newConstraints.forEach((newConstraint) => {
      const existingIndex = merged.findIndex(
        (c) => c.type === newConstraint.type,
      );

      if (existingIndex >= 0) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          extractedFrom: [
            ...new Set([
              ...merged[existingIndex].extractedFrom,
              ...newConstraint.extractedFrom,
            ]),
          ],
        };
      } else {
        merged.push(newConstraint);
      }
    });

    return merged;
  }

  private mergeAssumptions(
    existing: Assumption[],
    newAssumptions: Assumption[],
  ): Assumption[] {
    const merged = [...existing];

    newAssumptions.forEach((newAssumption) => {
      const existingIndex = merged.findIndex(
        (a) =>
          a.category === newAssumption.category &&
          a.description
            .toLowerCase()
            .includes(newAssumption.description.toLowerCase().slice(0, 20)),
      );

      if (existingIndex >= 0) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          extractedFrom: [
            ...new Set([
              ...merged[existingIndex].extractedFrom,
              ...newAssumption.extractedFrom,
            ]),
          ],
        };
      } else {
        merged.push(newAssumption);
      }
    });

    return merged;
  }
}

export const informationExtractionService =
  InformationExtractionService.getInstance();
