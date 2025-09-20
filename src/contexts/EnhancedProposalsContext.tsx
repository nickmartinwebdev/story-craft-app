import React, { createContext, useContext, useState, useCallback } from "react";
import {
  EnhancedProposal,
  EnhancedProposalMessage,
  ExtractedInformation,
  ProposalWorkflowPhase,
  WorkflowPhaseId,
  WorkflowProgress,
  InformationGatheringQuestion,
  GeneratedContent,
  UserStory,
  Epic,
} from "../types/enhanced-proposals";
import { informationExtractionService } from "../services/informationExtractionService";
import { questionGenerationService } from "../services/questionGenerationService";
import { storyEpicGenerationService } from "../services/storyEpicGenerationService";
import { ProposalDbService } from "../services/proposalDbService";

interface EnhancedProposalsContextType {
  currentProposal: EnhancedProposal | null;
  extractedInformation: ExtractedInformation;
  generatedContent: GeneratedContent;
  currentPhase: WorkflowPhaseId;
  workflowProgress: WorkflowProgress;
  isExtracting: boolean;
  isGenerating: boolean;

  // Actions
  createNewEnhancedProposal: (
    type: "story" | "epic" | "feature" | "project",
  ) => Promise<void>;
  addMessage: (content: string, isUser: boolean) => Promise<void>;
  generateNextQuestion: () => InformationGatheringQuestion | null;
  generateSmartResponse: (userInput: string) => Promise<string>;
  transitionToNextPhase: () => void;
  generateUserStories: () => Promise<void>;
  generateEpics: () => Promise<void>;
  regenerateContent: () => Promise<void>;
  updateUserStory: (storyId: string, updates: Partial<UserStory>) => void;
  updateEpic: (epicId: string, updates: Partial<Epic>) => void;
  updateExtractedInformation: (info: Partial<ExtractedInformation>) => void;
  resetWorkflow: () => void;
}

const EnhancedProposalsContext = createContext<
  EnhancedProposalsContextType | undefined
>(undefined);

interface EnhancedProposalsProviderProps {
  children: React.ReactNode;
}

export function EnhancedProposalsProvider({
  children,
}: EnhancedProposalsProviderProps) {
  const proposalDbService = ProposalDbService.getInstance();
  const [currentProposal, setCurrentProposal] =
    useState<EnhancedProposal | null>(null);
  const [extractedInformation, setExtractedInformation] =
    useState<ExtractedInformation>({
      personas: [],
      contexts: [],
      goals: [],
      constraints: [],
      assumptions: [],
      lastUpdated: new Date(),
    });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    userStories: [],
    epics: [],
    lastGenerated: new Date(),
    generationNotes: [],
  });
  const [currentPhase, setCurrentPhase] = useState<WorkflowPhaseId>(
    "information-gathering",
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Default workflow phases
  const defaultPhases: ProposalWorkflowPhase[] = [
    {
      id: "information-gathering",
      name: "Information Gathering",
      description:
        "Collecting key information about users, goals, and constraints",
      status: "in-progress",
    },
    {
      id: "story-formation",
      name: "Story Formation",
      description: "Creating user stories based on gathered information",
      status: "not-started",
    },
    {
      id: "epic-creation",
      name: "Epic Creation",
      description: "Organizing stories into meaningful epics",
      status: "not-started",
    },
    {
      id: "refinement",
      name: "Refinement",
      description: "Polishing and finalizing the proposal",
      status: "not-started",
    },
  ];

  // Calculate workflow progress
  const workflowProgress: WorkflowProgress = React.useMemo(() => {
    const assessment =
      questionGenerationService.assessReadinessForNextPhase(
        extractedInformation,
      );

    return {
      currentPhase,
      completionPercentage: assessment.completionPercentage,
      readyForNextPhase: assessment.ready,
      missingInformation: assessment.missingCategories,
      nextSuggestedAction: assessment.ready
        ? "Ready to move to story formation phase"
        : `Still need: ${assessment.missingCategories.join(", ")}`,
    };
  }, [currentPhase, extractedInformation]);

  // Create new enhanced proposal
  const createNewEnhancedProposal = useCallback(
    async (type: "story" | "epic" | "feature" | "project") => {
      const now = new Date();
      const newProposal: EnhancedProposal = {
        id: `enhanced-${Date.now()}`,
        title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Proposal`,
        description: "",
        messages: [
          {
            id: "1",
            content:
              "👋 **Welcome to your Enhanced Proposal Assistant!**\n\nI'm here to help you create a comprehensive proposal by gathering key information through our conversation. I'll ask you insightful questions to understand:\n\n✨ **What I'll help you discover:**\n• **User Personas** - Who will use or be affected by this\n• **Business Context** - The environment and situation\n• **Goals & Objectives** - What success looks like\n• **Constraints** - Limitations and boundaries\n• **Assumptions** - What we're taking for granted\n\n📊 **As we chat, I'll extract and organize this information in real-time**, showing you exactly what we've learned and what we still need to explore.\n\nLet's start! **What kind of project or initiative are you thinking about?**",
            isUser: false,
            timestamp: new Date(now.getTime()),
            phase: "information-gathering",
            questionCategory: "context",
          },
        ],
        extractedInformation: {
          personas: [],
          contexts: [],
          goals: [],
          constraints: [],
          assumptions: [],
          lastUpdated: new Date(now.getTime()),
        },
        generatedContent: {
          userStories: [],
          epics: [],
          lastGenerated: new Date(now.getTime()),
          generationNotes: [],
        },
        currentPhase: "information-gathering",
        phases: defaultPhases,
        workflowType: type,
        completionPercentage: 0,
        createdAt: new Date(now.getTime()),
        updatedAt: new Date(now.getTime()),
        tags: [type, "enhanced-workflow"],
        status: "draft",
      };

      setCurrentProposal(newProposal);
      setExtractedInformation(newProposal.extractedInformation);
      setGeneratedContent(newProposal.generatedContent);
      setCurrentPhase("information-gathering");

      // Persist the new proposal
      try {
        await proposalDbService.saveEnhancedProposal(newProposal);
      } catch (error) {
        console.error("Error saving new enhanced proposal:", error);
      }
    },
    [],
  );

  // Add message and process it for information extraction
  const addMessage = useCallback(
    async (content: string, isUser: boolean) => {
      if (!currentProposal) return;

      const now = Date.now();
      const newMessage: EnhancedProposalMessage = {
        id: `${now}_${isUser ? "user" : "ai"}`,
        content,
        isUser,
        timestamp: new Date(now),
        phase: currentPhase,
      };

      // Update proposal with new message
      setCurrentProposal((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          updatedAt: new Date(now),
        };
      });

      // If it's a user message, extract information from it
      if (isUser) {
        setIsExtracting(true);

        try {
          const extractionResult =
            informationExtractionService.extractInformationFromMessage(
              newMessage,
              extractedInformation,
            );

          if (Object.keys(extractionResult.extracted).length > 0) {
            const updatedInfo: ExtractedInformation = {
              personas:
                extractionResult.extracted.personas ||
                extractedInformation.personas,
              contexts:
                extractionResult.extracted.contexts ||
                extractedInformation.contexts,
              goals:
                extractionResult.extracted.goals || extractedInformation.goals,
              constraints:
                extractionResult.extracted.constraints ||
                extractedInformation.constraints,
              assumptions:
                extractionResult.extracted.assumptions ||
                extractedInformation.assumptions,
              lastUpdated: new Date(now),
            };

            setExtractedInformation(updatedInfo);

            // Update proposal with extracted information
            setCurrentProposal((prev) => {
              if (!prev) return null;
              const updated = {
                ...prev,
                extractedInformation: updatedInfo,
                completionPercentage:
                  questionGenerationService.assessReadinessForNextPhase(
                    updatedInfo,
                  ).completionPercentage,
              };

              // Persist updated proposal
              proposalDbService.saveEnhancedProposal(updated).catch((error) => {
                console.error("Error saving enhanced proposal:", error);
              });

              return updated;
            });

            // Update the user message with extracted info
            newMessage.extractedInfo = extractionResult.extracted;
          }
        } catch (error) {
          console.error("Error extracting information:", error);
        } finally {
          setIsExtracting(false);
        }
      }
    },
    [currentProposal, extractedInformation, currentPhase],
  );

  // Generate next question based on current context
  const generateNextQuestion =
    useCallback((): InformationGatheringQuestion | null => {
      if (!currentProposal) return null;

      const context = {
        existingInformation: extractedInformation,
        conversationHistory: currentProposal.messages,
        currentFocus: [],
        missingInformation: workflowProgress.missingInformation,
      };

      return questionGenerationService.generateNextQuestion(context);
    }, [
      currentProposal,
      extractedInformation,
      workflowProgress.missingInformation,
    ]);

  // Generate smart AI response
  const generateSmartResponse = useCallback(async (): Promise<string> => {
    if (!currentProposal)
      return "I'm having trouble accessing the current proposal.";

    const context = {
      existingInformation: extractedInformation,
      conversationHistory: currentProposal.messages,
      currentFocus: [],
      missingInformation: workflowProgress.missingInformation,
    };

    // Handle different phases
    switch (currentPhase) {
      case "information-gathering":
        // Check if we should transition phases
        if (workflowProgress.readyForNextPhase) {
          return questionGenerationService.generatePhaseTransitionMessage(
            workflowProgress.completionPercentage,
            workflowProgress.missingInformation,
          );
        }

        // Generate next question or smart response
        const nextQuestion =
          questionGenerationService.generateNextQuestion(context);

        if (nextQuestion) {
          return `💡 **Great insight!** I'm extracting some valuable information from what you've shared.\n\n**Next, let's explore:** ${nextQuestion.question}`;
        } else {
          return questionGenerationService.generateSmartQuestion(context);
        }

      case "story-formation":
        if (generatedContent.userStories.length === 0) {
          return "🚀 **Ready to create user stories!**\n\nI'll analyze all the information we've gathered to create well-structured user stories. Each story will follow the format:\n\n• **As a** [persona]\n• **I want** [functionality]\n• **So that** [business value]\n\nWould you like me to generate the initial user stories based on our conversation?";
        } else {
          return "📝 **User stories generated!**\n\nI've created user stories based on our discussion. You can review them in the sidebar and let me know if you'd like me to:\n\n• Add more stories\n• Modify existing ones\n• Add more detailed acceptance criteria\n• Move on to organizing them into epics";
        }

      case "epic-creation":
        if (generatedContent.epics.length === 0) {
          return "📚 **Time to organize into epics!**\n\nNow I'll group related user stories into coherent epics - larger themes that represent significant business capabilities.\n\nWould you like me to create epics from the user stories we've defined?";
        } else {
          return "🎯 **Epics created!**\n\nI've organized your user stories into epics. Each epic represents a major capability or theme. You can review the organization and let me know if you'd like any adjustments.";
        }

      case "refinement":
        return "✨ **Final refinement phase!**\n\nLet's polish the proposal by reviewing all content, ensuring completeness, and making any final adjustments before export.";

      default:
        return "I'm not sure what to do in this phase. Let me know how I can help!";
    }
  }, [
    currentProposal,
    extractedInformation,
    workflowProgress,
    currentPhase,
    generatedContent,
  ]);

  // Transition to next phase
  const transitionToNextPhase = useCallback(() => {
    if (!currentProposal) return;

    const phaseOrder: WorkflowPhaseId[] = [
      "information-gathering",
      "story-formation",
      "epic-creation",
      "refinement",
    ];

    const currentIndex = phaseOrder.indexOf(currentPhase);
    if (currentIndex < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[currentIndex + 1];

      setCurrentPhase(nextPhase);

      // Update proposal phases
      setCurrentProposal((prev) => {
        if (!prev) return null;

        const updatedPhases = prev.phases.map((phase) => {
          if (phase.id === currentPhase) {
            return {
              ...phase,
              status: "completed" as const,
              completedAt: new Date(),
            };
          }
          if (phase.id === nextPhase) {
            return { ...phase, status: "in-progress" as const };
          }
          return phase;
        });

        const updated = {
          ...prev,
          currentPhase: nextPhase,
          phases: updatedPhases,
          generatedContent: prev.generatedContent,
          updatedAt: new Date(),
        };

        // Persist phase transition
        proposalDbService.saveEnhancedProposal(updated).catch((error) => {
          console.error("Error saving enhanced proposal:", error);
        });

        return updated;
      });
    }
  }, [currentProposal, currentPhase]);

  // Generate user stories from extracted information
  const generateUserStories = useCallback(async () => {
    if (!currentProposal) return;

    setIsGenerating(true);
    try {
      const stories =
        storyEpicGenerationService.generateUserStories(extractedInformation);

      const updatedContent: GeneratedContent = {
        ...generatedContent,
        userStories: stories,
        lastGenerated: new Date(),
        generationNotes: [
          ...generatedContent.generationNotes,
          `Generated ${stories.length} user stories from extracted information`,
        ],
      };

      setGeneratedContent(updatedContent);

      // Update proposal
      setCurrentProposal((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          generatedContent: updatedContent,
          updatedAt: new Date(),
        };

        // Persist updated proposal
        proposalDbService.saveEnhancedProposal(updated).catch((error) => {
          console.error("Error saving enhanced proposal:", error);
        });

        return updated;
      });

      // Add AI message about generation
      await addMessage(
        `🎉 **Generated ${stories.length} user stories!**\n\nI've created user stories based on the personas, goals, and constraints we discussed. Each story follows the standard format and includes acceptance criteria. You can review them in the sidebar and let me know if you'd like any adjustments.`,
        false,
      );
    } catch (error) {
      console.error("Error generating user stories:", error);
      await addMessage(
        "❌ **Sorry, I encountered an error while generating user stories.** Please try again or let me know if you need assistance.",
        false,
      );
    } finally {
      setIsGenerating(false);
    }
  }, [currentProposal, extractedInformation, generatedContent, addMessage]);

  // Generate epics from user stories
  const generateEpics = useCallback(async () => {
    if (!currentProposal || generatedContent.userStories.length === 0) return;

    setIsGenerating(true);
    try {
      const epics = storyEpicGenerationService.generateEpics(
        generatedContent.userStories,
        extractedInformation,
      );

      const updatedContent: GeneratedContent = {
        ...generatedContent,
        epics,
        lastGenerated: new Date(),
        generationNotes: [
          ...generatedContent.generationNotes,
          `Generated ${epics.length} epics organizing ${generatedContent.userStories.length} user stories`,
        ],
      };

      setGeneratedContent(updatedContent);

      // Update proposal
      setCurrentProposal((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          generatedContent: updatedContent,
          updatedAt: new Date(),
        };

        // Persist updated proposal
        proposalDbService.saveEnhancedProposal(updated).catch((error) => {
          console.error("Error saving enhanced proposal:", error);
        });

        return updated;
      });

      // Add AI message about generation
      await addMessage(
        `📚 **Created ${epics.length} epics!**\n\nI've organized your user stories into meaningful epics that represent major business capabilities. Each epic groups related stories and includes business value, success metrics, and effort estimates.`,
        false,
      );
    } catch (error) {
      console.error("Error generating epics:", error);
      await addMessage(
        "❌ **Sorry, I encountered an error while creating epics.** Please try again or let me know if you need assistance.",
        false,
      );
    } finally {
      setIsGenerating(false);
    }
  }, [currentProposal, extractedInformation, generatedContent, addMessage]);

  // Regenerate all content
  const regenerateContent = useCallback(async () => {
    if (!currentProposal) return;

    setIsGenerating(true);
    try {
      const newContent =
        storyEpicGenerationService.generateContent(extractedInformation);

      setGeneratedContent(newContent);

      // Update proposal
      setCurrentProposal((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          generatedContent: newContent,
          updatedAt: new Date(),
        };

        // Persist updated proposal
        proposalDbService.saveEnhancedProposal(updated).catch((error) => {
          console.error("Error saving enhanced proposal:", error);
        });

        return updated;
      });

      await addMessage(
        `🔄 **Content regenerated!**\n\nI've recreated all user stories and epics based on the current extracted information. Generated ${newContent.userStories.length} stories organized into ${newContent.epics.length} epics.`,
        false,
      );
    } catch (error) {
      console.error("Error regenerating content:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [currentProposal, extractedInformation, addMessage]);

  // Update individual user story
  const updateUserStory = useCallback(
    (storyId: string, updates: Partial<UserStory>) => {
      setGeneratedContent((prev) => {
        const updatedStories = prev.userStories.map((story) =>
          story.id === storyId ? { ...story, ...updates } : story,
        );

        return {
          ...prev,
          userStories: updatedStories,
          lastGenerated: new Date(),
        };
      });

      // Update proposal
      setCurrentProposal((prev) => {
        if (!prev) return null;
        const updatedContent = {
          ...prev.generatedContent,
          userStories: prev.generatedContent.userStories.map((story) =>
            story.id === storyId ? { ...story, ...updates } : story,
          ),
        };
        const updated = {
          ...prev,
          generatedContent: updatedContent,
          updatedAt: new Date(),
        };

        // Persist updated proposal
        proposalDbService.saveEnhancedProposal(updated).catch((error) => {
          console.error("Error saving enhanced proposal:", error);
        });

        return updated;
      });
    },
    [],
  );

  // Update individual epic
  const updateEpic = useCallback((epicId: string, updates: Partial<Epic>) => {
    setGeneratedContent((prev) => {
      const updatedEpics = prev.epics.map((epic) =>
        epic.id === epicId ? { ...epic, ...updates } : epic,
      );

      return {
        ...prev,
        epics: updatedEpics,
        lastGenerated: new Date(),
      };
    });

    // Update proposal
    setCurrentProposal((prev) => {
      if (!prev) return null;
      const updatedContent = {
        ...prev.generatedContent,
        epics: prev.generatedContent.epics.map((epic) =>
          epic.id === epicId ? { ...epic, ...updates } : epic,
        ),
      };
      const updated = {
        ...prev,
        generatedContent: updatedContent,
        updatedAt: new Date(),
      };

      // Persist updated proposal
      proposalDbService.saveEnhancedProposal(updated).catch((error) => {
        console.error("Error saving enhanced proposal:", error);
      });

      return updated;
    });
  }, []);

  // Update extracted information manually
  const updateExtractedInformation = useCallback(
    (info: Partial<ExtractedInformation>) => {
      setExtractedInformation((prev) => ({
        ...prev,
        ...info,
        lastUpdated: new Date(),
      }));

      if (currentProposal) {
        setCurrentProposal((prev) => {
          if (!prev) return null;

          const updatedInfo = {
            ...prev.extractedInformation,
            ...info,
            lastUpdated: new Date(),
          };
          const updated = {
            ...prev,
            extractedInformation: updatedInfo,
            completionPercentage:
              questionGenerationService.assessReadinessForNextPhase(updatedInfo)
                .completionPercentage,
            generatedContent: prev.generatedContent,
            updatedAt: new Date(),
          };

          // Persist updated proposal
          proposalDbService.saveEnhancedProposal(updated).catch((error) => {
            console.error("Error saving enhanced proposal:", error);
          });

          return updated;
        });
      }
    },
    [currentProposal],
  );

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    setCurrentProposal(null);
    setExtractedInformation({
      personas: [],
      contexts: [],
      goals: [],
      constraints: [],
      assumptions: [],
      lastUpdated: new Date(),
    });
    setGeneratedContent({
      userStories: [],
      epics: [],
      lastGenerated: new Date(),
      generationNotes: [],
    });
    setCurrentPhase("information-gathering");
    setIsExtracting(false);
    setIsGenerating(false);
  }, []);

  const value: EnhancedProposalsContextType = {
    currentProposal,
    extractedInformation,
    generatedContent,
    currentPhase,
    workflowProgress,
    isExtracting,
    isGenerating,
    createNewEnhancedProposal,
    addMessage,
    generateNextQuestion,
    generateSmartResponse,
    transitionToNextPhase,
    generateUserStories,
    generateEpics,
    regenerateContent,
    updateUserStory,
    updateEpic,
    updateExtractedInformation,
    resetWorkflow,
  };

  return (
    <EnhancedProposalsContext.Provider value={value}>
      {children}
    </EnhancedProposalsContext.Provider>
  );
}

export function useEnhancedProposals() {
  const context = useContext(EnhancedProposalsContext);
  if (context === undefined) {
    throw new Error(
      "useEnhancedProposals must be used within an EnhancedProposalsProvider",
    );
  }
  return context;
}
