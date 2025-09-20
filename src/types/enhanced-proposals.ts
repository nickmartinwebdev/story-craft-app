// Enhanced proposal workflow types for multi-part information gathering

import { ProposalMessage, SavedProposal } from "./proposals";

export interface UserPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  painPoints: string[];
  goals: string[];
  behaviors: string[];
  extractedFrom: string[]; // message IDs where this was mentioned
}

export interface BusinessContext {
  id: string;
  category:
    | "market"
    | "technology"
    | "organizational"
    | "regulatory"
    | "competitive";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  extractedFrom: string[];
}

export interface ProjectGoal {
  id: string;
  type: "business" | "user" | "technical" | "operational";
  description: string;
  priority: "high" | "medium" | "low";
  measurable: boolean;
  metrics?: string[];
  extractedFrom: string[];
}

export interface Constraint {
  id: string;
  type: "budget" | "timeline" | "technical" | "regulatory" | "resource";
  description: string;
  severity: "critical" | "important" | "minor";
  workaround?: string;
  extractedFrom: string[];
}

export interface Assumption {
  id: string;
  category: "business" | "technical" | "user" | "market";
  description: string;
  confidence: "high" | "medium" | "low";
  needsValidation: boolean;
  extractedFrom: string[];
}

export interface ExtractedInformation {
  personas: UserPersona[];
  contexts: BusinessContext[];
  goals: ProjectGoal[];
  constraints: Constraint[];
  assumptions: Assumption[];
  lastUpdated: Date;
}

export interface ProposalWorkflowPhase {
  id: string;
  name: string;
  description: string;
  status: "not-started" | "in-progress" | "completed";
  completedAt?: Date;
}

export interface EnhancedProposalMessage extends ProposalMessage {
  phase:
    | "information-gathering"
    | "story-formation"
    | "epic-creation"
    | "refinement";
  extractedInfo?: Partial<ExtractedInformation>;
  questionCategory?:
    | "persona"
    | "context"
    | "goals"
    | "constraints"
    | "assumptions"
    | "validation";
}

export interface EnhancedProposal extends Omit<SavedProposal, "messages"> {
  messages: EnhancedProposalMessage[];
  extractedInformation: ExtractedInformation;
  generatedContent: GeneratedContent;
  currentPhase: ProposalWorkflowPhase["id"];
  phases: ProposalWorkflowPhase[];
  workflowType: "story" | "epic" | "feature" | "project";
  completionPercentage: number;
}

export interface InformationGatheringQuestion {
  id: string;
  category:
    | "persona"
    | "context"
    | "goals"
    | "constraints"
    | "assumptions"
    | "validation";
  question: string;
  followUpQuestions?: string[];
  priority: number;
  prerequisiteCategories?: string[];
}

export interface QuestionGenerationContext {
  existingInformation: ExtractedInformation;
  conversationHistory: EnhancedProposalMessage[];
  currentFocus: string[];
  missingInformation: string[];
}

export type WorkflowPhaseId =
  | "information-gathering"
  | "story-formation"
  | "epic-creation"
  | "refinement";

export interface WorkflowTransitionCriteria {
  phaseId: WorkflowPhaseId;
  requiredInformation: {
    minPersonas: number;
    minGoals: number;
    minContexts: number;
    hasConstraints: boolean;
    hasValidatedAssumptions: boolean;
  };
  completionThreshold: number; // percentage
}

export interface InformationExtractionResult {
  extracted: Partial<ExtractedInformation>;
  confidence: number;
  suggestedQuestions: string[];
}

export interface AcceptanceCriteria {
  id: string;
  description: string;
  priority: "must" | "should" | "could";
  testable: boolean;
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  asA: string; // "As a..." - user persona
  iWant: string; // "I want..." - functionality
  soThat: string; // "So that..." - business value/goal
  acceptanceCriteria: AcceptanceCriteria[];
  priority: "high" | "medium" | "low";
  estimatedEffort: "xs" | "s" | "m" | "l" | "xl";
  tags: string[];
  relatedPersonas: string[]; // IDs of related personas
  relatedGoals: string[]; // IDs of related goals
  constraints: string[]; // IDs of related constraints
  createdFrom: string[]; // IDs of extracted information that contributed
  status: "draft" | "refined" | "approved";
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  goal: string; // High-level objective
  businessValue: string;
  userStories: string[]; // IDs of user stories in this epic
  priority: "high" | "medium" | "low";
  theme: string; // Thematic grouping (e.g., 'User Management', 'Reporting')
  estimatedEffort: "small" | "medium" | "large" | "extra-large";
  relatedPersonas: string[]; // IDs of personas this epic serves
  relatedGoals: string[]; // IDs of goals this epic addresses
  constraints: string[]; // IDs of constraints that affect this epic
  assumptions: string[]; // IDs of assumptions this epic relies on
  successMetrics: string[]; // How success will be measured
  createdFrom: string[]; // IDs of extracted information that contributed
  status: "draft" | "refined" | "approved";
}

export interface GeneratedContent {
  userStories: UserStory[];
  epics: Epic[];
  lastGenerated: Date;
  generationNotes: string[];
}

export interface WorkflowProgress {
  currentPhase: WorkflowPhaseId;
  completionPercentage: number;
  readyForNextPhase: boolean;
  missingInformation: string[];
  nextSuggestedAction: string;
}
