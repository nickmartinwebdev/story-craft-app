# Enhanced Proposals Workflow Documentation

## Overview

The Enhanced Proposals Workflow is a sophisticated multi-part system that uses AI-powered conversation to intelligently gather, extract, and organize information for creating comprehensive project proposals, user stories, and epics. This system goes beyond simple chat by actively extracting structured information and guiding users through a systematic discovery process.

## Key Features

### 🧠 Intelligent Information Extraction
- **Real-time Analysis**: Extracts structured data from natural conversation
- **Categorized Intelligence**: Automatically organizes information into personas, contexts, goals, constraints, and assumptions
- **Smart Merging**: Prevents duplicate information while enhancing existing data
- **Confidence Scoring**: Tracks the reliability of extracted information

### 📊 Live Information Dashboard
- **Real-time Sidebar**: Shows extracted information as you chat
- **Progress Tracking**: Visual completion percentage with phase readiness indicators
- **Categorized Views**: Collapsible sections for different information types
- **Validation Indicators**: Highlights assumptions that need validation

### 🎯 Multi-Phase Workflow
1. **Information Gathering**: AI asks insightful questions to discover key details
2. **Story Formation**: Creates user stories based on gathered information  
3. **Epic Creation**: Organizes stories into meaningful epics
4. **Refinement**: Polishes and finalizes the proposal

### 💡 Context-Aware Question Generation
- **Smart Question Bank**: 25+ carefully crafted questions across 6 categories
- **Dependency Logic**: Questions unlock based on previously gathered information
- **Adaptive Responses**: AI adjusts questions based on what's already known
- **Follow-up Intelligence**: Generates contextual follow-up questions

## Information Categories

### 👥 User Personas
Automatically identifies and tracks:
- **Role & Responsibilities**: Job titles and main duties
- **Pain Points**: Current frustrations and challenges
- **Goals**: What they want to achieve
- **Behaviors**: Usage patterns and preferences
- **Extraction Confidence**: Tracks source messages

### 🏢 Business Context  
Captures environmental factors:
- **Market Context**: Competition, industry trends
- **Technology Context**: Current systems and platforms
- **Organizational Context**: Company structure and culture
- **Regulatory Context**: Compliance and legal requirements
- **Competitive Context**: Alternatives and competitors

### 🎯 Project Goals
Structures objectives with:
- **Goal Types**: Business, user, technical, operational
- **Priority Levels**: High, medium, low importance
- **Measurability**: Whether success can be quantified
- **Success Metrics**: KPIs and measurement approaches

### 🔒 Constraints
Identifies limitations including:
- **Budget Constraints**: Financial limitations
- **Timeline Constraints**: Deadline pressures  
- **Technical Constraints**: System limitations
- **Regulatory Constraints**: Compliance requirements
- **Resource Constraints**: People and skill limitations

### ❓ Assumptions
Tracks beliefs and expectations:
- **Assumption Categories**: Business, technical, user, market
- **Confidence Levels**: How certain we are about each assumption
- **Validation Needs**: Which assumptions require verification

## Technical Architecture

### Information Extraction Service
```typescript
class InformationExtractionService {
  // Analyzes messages for structured information
  extractInformationFromMessage(message, existingInfo): ExtractionResult
  
  // Merges new information with existing data
  mergePersonas/Contexts/Goals/Constraints/Assumptions()
  
  // Generates follow-up questions based on extraction
  generateSuggestedQuestions(extracted): string[]
}
```

### Question Generation Service
```typescript  
class QuestionGenerationService {
  // 25+ pre-crafted questions across 6 categories
  questionBank: InformationGatheringQuestion[]
  
  // Generates next most relevant question
  generateNextQuestion(context): Question | null
  
  // Creates contextual follow-ups
  generateFollowUp(originalQuestion, userResponse): string
  
  // Assesses readiness for next workflow phase
  assessReadinessForNextPhase(info): ReadinessAssessment
}
```

### Enhanced Proposals Context
```typescript
interface EnhancedProposalsContextType {
  // Current state
  currentProposal: EnhancedProposal | null
  extractedInformation: ExtractedInformation  
  workflowProgress: WorkflowProgress
  
  // Actions
  createNewEnhancedProposal(type): void
  addMessage(content, isUser): Promise<void>
  generateSmartResponse(input): Promise<string>
  transitionToNextPhase(): void
}
```

## Workflow Phases

### Phase 1: Information Gathering (Current Implementation)
- **Goal**: Collect comprehensive information about the project
- **Duration**: Until 80% completion threshold reached
- **Required Information**:
  - Minimum 2 user personas
  - Minimum 3 business contexts  
  - Minimum 2 goals
  - Minimum 2 constraints
  - Minimum 1 assumption
- **AI Behavior**: Asks targeted questions, extracts information, provides feedback
- **Completion Criteria**: 80% of required information gathered

### Phase 2: Story Formation (Planned)
- **Goal**: Convert gathered information into structured user stories
- **Input**: Extracted personas, goals, and contexts
- **Output**: Well-formed user stories with acceptance criteria
- **AI Behavior**: Creates stories, suggests improvements, validates completeness

### Phase 3: Epic Creation (Planned) 
- **Goal**: Group related stories into coherent epics
- **Input**: Generated user stories
- **Output**: Organized epics with story hierarchies
- **AI Behavior**: Suggests groupings, creates epic themes, defines epic goals

### Phase 4: Refinement (Planned)
- **Goal**: Polish and finalize the proposal
- **Input**: Organized epics and stories
- **Output**: Publication-ready proposal document
- **AI Behavior**: Reviews for gaps, suggests improvements, formats output

## Question Strategy

### Categories & Priorities

#### 🏆 High Priority (8-10)
- **Persona Discovery**: "Who are the primary users affected by this proposal?"
- **Context Setting**: "What's driving this need in your business?"
- **Goal Definition**: "What business outcomes are you hoping to achieve?"

#### 🥈 Medium Priority (5-7)
- **Constraint Identification**: "What budget range are you working with?"
- **Assumption Surfacing**: "What are you assuming about user adoption?"
- **Validation Planning**: "How will you validate this solution works?"

#### 🥉 Lower Priority (1-4)
- **Secondary Benefits**: "What nice-to-have outcomes might emerge?"
- **Risk Mitigation**: "What could go wrong and how would you know?"

### Prerequisites & Dependencies
Questions unlock based on gathered information:
- Detailed persona questions require basic personas first
- Goal validation questions require goals to be defined
- Assumption questions need both personas and goals
- Advanced constraint questions build on basic constraints

### Follow-up Logic
The system generates contextual follow-ups:
- **Short responses** (< 15 words): Ask for more detail
- **Detailed responses** (> 50 words): Ask for clarification or next level
- **Medium responses**: Use first available follow-up

## User Experience Flow

### 1. Starting a New Proposal
```
User: Clicks "User Story Creation"
System: Creates new enhanced proposal
AI: "Welcome! I'll help you create comprehensive user stories..."
```

### 2. Information Gathering Conversation
```
User: "I want to build a dashboard for our sales team"
AI: [Extracts: personas=sales team, context=dashboard] 
    "Great! Tell me about the sales team members who would use this..."
User: "Account managers and sales directors mainly..."
AI: [Extracts: personas=account managers, sales directors]
    "What specific challenges do they face with their current tools?"
```

### 3. Real-time Information Display
The sidebar updates live showing:
- **Progress**: 45% complete, ready for next phase at 80%
- **Personas**: Account Managers, Sales Directors  
- **Context**: Sales dashboard project
- **Goals**: (None identified yet)
- **Missing**: Goals, constraints, assumptions

### 4. Phase Transition
```
System: Progress reaches 80%
AI: "Great! We have enough information to start forming stories..."
Button: "Ready for Next Phase" appears
User: Clicks transition button
AI: "Let's create your first user story based on what we've learned..."
```

## Development Status

### ✅ Completed (Phase 1)
- [x] Information extraction service with 8 category types
- [x] Question generation service with 25+ smart questions  
- [x] Real-time extraction from conversation
- [x] Live information dashboard with progress tracking
- [x] Enhanced proposal context and state management
- [x] Multi-phase workflow infrastructure
- [x] Animated UI components with smooth transitions
- [x] Question prerequisite and dependency logic
- [x] Completion assessment and phase readiness

### 🚧 In Progress
- [ ] Story formation phase implementation
- [ ] Epic creation workflow
- [ ] Proposal export functionality
- [ ] Advanced information merging logic

### 📋 Planned Features
- [ ] Integration with external LLM APIs (currently uses mock responses)
- [ ] Persistence to TanStack DB collections
- [ ] Collaborative proposal editing
- [ ] Template-based proposal generation
- [ ] Advanced analytics and insights
- [ ] Export to multiple formats (PDF, Word, Confluence)

## Usage Examples

### Example 1: E-commerce Feature
```
User Input: "We want to add a wishlist feature to our e-commerce site"

Extracted Information:
- Personas: Online shoppers, returning customers
- Context: E-commerce platform enhancement  
- Goals: Increase user engagement, improve conversion
- Constraints: Must integrate with existing cart system
- Assumptions: Users want to save items for later

AI Questions Generated:
1. "Who are the main types of shoppers who would use wishlists?"
2. "What's driving the need for wishlist functionality now?"
3. "How will you measure success of the wishlist feature?"
```

### Example 2: Internal Tool Development
```
User Input: "Our HR team needs a better way to track employee onboarding"

Extracted Information:
- Personas: HR coordinators, new employees, managers
- Context: Internal process improvement
- Goals: Streamline onboarding, reduce manual work
- Constraints: Must comply with privacy regulations
- Assumptions: Current process is inefficient

AI Questions Generated:  
1. "Walk me through the current onboarding process step by step"
2. "What are the biggest pain points HR coordinators face?"
3. "What would make new employees feel more supported during onboarding?"
```

## Configuration & Customization

### Question Bank Customization
Add new questions to `questionGenerationService.ts`:
```typescript
{
  id: 'custom-1',
  category: 'persona',
  question: "Your custom question here?",
  followUpQuestions: ["Follow up 1", "Follow up 2"],
  priority: 8,
  prerequisiteCategories: ['context']
}
```

### Information Categories
Extend extraction in `informationExtractionService.ts`:
```typescript
// Add new category type
interface CustomContext {
  id: string;
  category: 'your-category';  
  // ... other properties
}

// Add extraction logic
private extractCustomInfo(content: string, messageId: string): CustomContext[]
```

### Completion Thresholds
Adjust phase transition criteria in `questionGenerationService.ts`:
```typescript
const requirements = {
  personas: { min: 3, actual: info.personas.length }, // Require 3 instead of 2
  contexts: { min: 5, actual: info.contexts.length }, // Require 5 instead of 3
  // ...
};
```

## Integration Points

### TanStack DB Storage
```typescript
// Extend proposal db service
interface EnhancedProposalRecord extends SavedProposal {
  extractedInformation: ExtractedInformation;
  workflowPhase: WorkflowPhaseId;  
  completionPercentage: number;
}
```

### External LLM APIs
Replace mock responses with real API calls:
```typescript
// In generateSmartResponse
const response = await fetch('/api/llm/generate', {
  method: 'POST',
  body: JSON.stringify({
    context: extractedInformation,
    userInput: message,
    phase: currentPhase
  })
});
```

## Performance Considerations

- **Information Extraction**: O(n) complexity per message, cached results
- **Question Generation**: O(1) lookup with O(n) filtering  
- **UI Updates**: Debounced real-time updates to prevent excessive re-renders
- **Memory Usage**: Bounded by conversation length, garbage collected on reset

## Security & Privacy

- **No External Calls**: Currently runs entirely client-side
- **Local Storage**: Uses TanStack DB for local persistence
- **Data Isolation**: Each proposal workspace is isolated
- **No PII Storage**: Extracts patterns, not specific personal data

---

*This enhanced workflow transforms simple chat into intelligent proposal creation, making the complex process of gathering requirements both systematic and conversational.*