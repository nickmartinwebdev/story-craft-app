// Test file to verify story and epic generation functionality
import { storyEpicGenerationService } from "./services/storyEpicGenerationService";
import { ExtractedInformation } from "./types/enhanced-proposals";

// Sample extracted information for testing
const sampleExtractedInfo: ExtractedInformation = {
  personas: [
    {
      id: "persona-1",
      name: "Sales Manager",
      role: "Sales Manager",
      description: "Manages sales team and tracks performance",
      painPoints: [
        "Difficulty tracking team performance across multiple tools",
        "Manual reporting takes too much time",
        "Lack of real-time visibility into pipeline"
      ],
      goals: [
        "Improve team productivity",
        "Get better insights into sales performance",
        "Reduce manual work"
      ],
      behaviors: [
        "Checks dashboard multiple times per day",
        "Needs mobile access for client meetings",
        "Prefers visual data over spreadsheets"
      ],
      extractedFrom: ["msg-1", "msg-2"]
    },
    {
      id: "persona-2",
      name: "Sales Representative",
      role: "Sales Representative",
      description: "Front-line sales person handling leads and customers",
      painPoints: [
        "CRM is slow and clunky",
        "Hard to find customer information quickly",
        "Too many clicks to update lead status"
      ],
      goals: [
        "Close more deals faster",
        "Spend more time selling, less on admin",
        "Better customer relationship management"
      ],
      behaviors: [
        "Works on mobile frequently",
        "Needs quick access to customer history",
        "Values simple, intuitive interfaces"
      ],
      extractedFrom: ["msg-3", "msg-4"]
    }
  ],
  contexts: [
    {
      id: "context-1",
      category: "technology",
      title: "Legacy CRM System",
      description: "Current system is outdated and slow",
      impact: "high",
      extractedFrom: ["msg-1"]
    },
    {
      id: "context-2",
      category: "market",
      title: "Competitive Pressure",
      description: "Need to respond faster to market changes",
      impact: "medium",
      extractedFrom: ["msg-2"]
    },
    {
      id: "context-3",
      category: "organizational",
      title: "Remote Sales Team",
      description: "Team is distributed across multiple locations",
      impact: "high",
      extractedFrom: ["msg-3"]
    }
  ],
  goals: [
    {
      id: "goal-1",
      type: "business",
      description: "Increase sales team productivity by 25%",
      priority: "high",
      measurable: true,
      metrics: ["Time to close deals", "Number of activities per rep"],
      extractedFrom: ["msg-1", "msg-2"]
    },
    {
      id: "goal-2",
      type: "user",
      description: "Improve user experience for sales representatives",
      priority: "high",
      measurable: true,
      metrics: ["User satisfaction score", "Task completion time"],
      extractedFrom: ["msg-3"]
    },
    {
      id: "goal-3",
      type: "technical",
      description: "Modernize sales technology stack",
      priority: "medium",
      measurable: false,
      extractedFrom: ["msg-4"]
    }
  ],
  constraints: [
    {
      id: "constraint-1",
      type: "budget",
      description: "Limited budget of $50,000 for the project",
      severity: "important",
      extractedFrom: ["msg-5"]
    },
    {
      id: "constraint-2",
      type: "timeline",
      description: "Must be completed within 6 months",
      severity: "critical",
      extractedFrom: ["msg-6"]
    },
    {
      id: "constraint-3",
      type: "technical",
      description: "Must integrate with existing ERP system",
      severity: "critical",
      extractedFrom: ["msg-7"]
    }
  ],
  assumptions: [
    {
      id: "assumption-1",
      category: "user",
      description: "Sales reps will adopt new system quickly",
      confidence: "medium",
      needsValidation: true,
      extractedFrom: ["msg-8"]
    },
    {
      id: "assumption-2",
      category: "technical",
      description: "Current data can be migrated without issues",
      confidence: "low",
      needsValidation: true,
      extractedFrom: ["msg-9"]
    }
  ],
  lastUpdated: new Date()
};

// Test function to run story and epic generation
export function testStoryGeneration() {
  console.log("=== Testing Story and Epic Generation ===\n");

  try {
    // Generate user stories
    console.log("Generating user stories...");
    const userStories = storyEpicGenerationService.generateUserStories(sampleExtractedInfo);
    console.log(`Generated ${userStories.length} user stories:\n`);

    userStories.forEach((story, index) => {
      console.log(`${index + 1}. ${story.title}`);
      console.log(`   Priority: ${story.priority} | Effort: ${story.estimatedEffort}`);
      console.log(`   As a ${story.asA}`);
      console.log(`   I want ${story.iWant}`);
      console.log(`   So that ${story.soThat}`);
      console.log(`   Acceptance Criteria: ${story.acceptanceCriteria.length}`);
      console.log(`   Tags: ${story.tags.join(", ")}\n`);
    });

    // Generate epics
    console.log("Generating epics...");
    const epics = storyEpicGenerationService.generateEpics(userStories, sampleExtractedInfo);
    console.log(`Generated ${epics.length} epics:\n`);

    epics.forEach((epic, index) => {
      console.log(`${index + 1}. ${epic.title} (${epic.theme})`);
      console.log(`   Priority: ${epic.priority} | Effort: ${epic.estimatedEffort}`);
      console.log(`   Goal: ${epic.goal}`);
      console.log(`   Business Value: ${epic.businessValue}`);
      console.log(`   Stories: ${epic.userStories.length}`);
      console.log(`   Success Metrics: ${epic.successMetrics.join(", ")}\n`);
    });

    // Generate complete content
    console.log("Generating complete content...");
    const content = storyEpicGenerationService.generateContent(sampleExtractedInfo);
    console.log(`Complete content generated:`);
    console.log(`- ${content.userStories.length} user stories`);
    console.log(`- ${content.epics.length} epics`);
    console.log(`- Generation notes: ${content.generationNotes.length}`);
    console.log(`\nGeneration Notes:`);
    content.generationNotes.forEach((note, index) => {
      console.log(`${index + 1}. ${note}`);
    });

    console.log("\n=== Test completed successfully! ===");
    return { userStories, epics, content };

  } catch (error) {
    console.error("Test failed with error:", error);
    throw error;
  }
}

// Run the test if this file is executed directly
if (typeof window === "undefined") {
  // Node.js environment
  testStoryGeneration();
}
