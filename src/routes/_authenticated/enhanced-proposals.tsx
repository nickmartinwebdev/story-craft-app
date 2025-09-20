import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Paper,
  Title,
  Stack,
  Group,
  TextInput,
  ScrollArea,
  Box,
  Text,
  Avatar,
  ActionIcon,
  Divider,
  Transition,
  Badge,
  Menu,
  Tooltip,
  Grid,
  Card,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconSend,
  IconUser,
  IconRobot,
  IconTrash,
  IconList,
  IconDots,
  IconSparkles,
  IconBrain,
  IconArrowRight,
  IconRefresh,
  IconFlask,
} from "@tabler/icons-react";
import React, { useState, useMemo, useRef, useLayoutEffect } from "react";

import {
  EnhancedProposalsProvider,
  useEnhancedProposals,
} from "../../contexts/EnhancedProposalsContext";
import { TypingIndicator } from "../../components/TypingIndicator";
import { InformationExtractionSidebar } from "../../components/InformationExtractionSidebar";
import { ContentGenerationPanel } from "../../components/enhanced-proposals/ContentGenerationPanel";
import { EnhancedProposalMessage } from "../../types/enhanced-proposals";
import { notifications } from "@mantine/notifications";

export const Route = createFileRoute("/_authenticated/enhanced-proposals")({
  component: () => (
    <EnhancedProposalsProvider>
      <EnhancedProposalsPage />
    </EnhancedProposalsProvider>
  ),
});

// Utility function for safe timestamp formatting
const formatTimestampSafe = (timestamp: any): string => {
  try {
    // Handle various timestamp formats
    let date = timestamp;

    if (!date) {
      date = new Date();
    } else if (typeof date === "string") {
      date = new Date(date);
    } else if (typeof date === "number") {
      date = new Date(date);
    } else if (!(date instanceof Date)) {
      date = new Date();
    }

    // Final validation
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      date = new Date();
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Invalid time";
  }
};

function EnhancedProposalsPage() {
  const {
    currentProposal,
    extractedInformation,
    currentPhase,
    workflowProgress,
    isExtracting,
    createNewEnhancedProposal,
    addMessage,
    generateSmartResponse,
    transitionToNextPhase,
    resetWorkflow,
    updateExtractedInformation,
  } = useEnhancedProposals();

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Always ensure we have messages and normalize timestamps
  const messages = useMemo(() => {
    if (!currentProposal?.messages) return [];

    return currentProposal.messages.map((message) => {
      let normalizedTimestamp;
      if (message.timestamp instanceof Date) {
        normalizedTimestamp = message.timestamp;
      } else {
        normalizedTimestamp = new Date(message.timestamp || Date.now());
      }

      return {
        ...message,
        timestamp: normalizedTimestamp,
      };
    });
  }, [currentProposal?.messages]);

  // Use refs to track scroll behavior
  const shouldAutoScrollRef = useRef(true);
  const lastMessageCountRef = useRef(messages.length);
  const userScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useLayoutEffect(() => {
    // Only auto-scroll when message count changes and user isn't scrolling
    if (
      messages.length > lastMessageCountRef.current &&
      shouldAutoScrollRef.current &&
      !userScrollingRef.current &&
      scrollAreaRef.current
    ) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
    lastMessageCountRef.current = messages.length;
  }, [messages.length]);

  // Handle user scroll detection
  const handleScroll = () => {
    userScrollingRef.current = true;
    shouldAutoScrollRef.current = false;

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Re-enable auto-scroll after user stops scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      userScrollingRef.current = false;

      // Check if user scrolled to bottom, if so, re-enable auto-scroll
      if (scrollAreaRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
        shouldAutoScrollRef.current = isAtBottom;
      }
    }, 150);
  };

  // Prevent auto-scroll when user is typing
  const handleInputFocus = () => {
    shouldAutoScrollRef.current = false;
  };

  const handleInputBlur = () => {
    shouldAutoScrollRef.current = true;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentProposal) return;

    const userInput = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    // Force scroll to bottom after user message and maintain focus
    shouldAutoScrollRef.current = true;
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 0);

    try {
      // Add user message
      await addMessage(userInput, true);

      // Generate AI response
      const aiResponse = await generateSmartResponse(userInput);

      // Add AI message after a delay
      setTimeout(
        async () => {
          await addMessage(aiResponse, false);
          setIsLoading(false);

          // Scroll to bottom after AI response and restore focus
          shouldAutoScrollRef.current = true;
          setTimeout(() => {
            if (scrollAreaRef.current) {
              scrollAreaRef.current.scrollTop =
                scrollAreaRef.current.scrollHeight;
            }
            if (textInputRef.current && !document.activeElement) {
              textInputRef.current.focus();
            }
          }, 0);
        },
        1500 + Math.random() * 1000,
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
      notifications.show({
        title: "Error",
        message: "Failed to send message. Please try again.",
        color: "red",
      });
    }
  };

  const handleStartNewProposal = async (
    type: "story" | "epic" | "feature" | "project",
  ) => {
    await createNewEnhancedProposal(type);
  };

  const quickStartOptions = [
    {
      title: "User Story Creation",
      description: "Create detailed user stories for your feature or product",
      type: "story" as const,
      icon: IconUser,
      color: "blue",
    },
    {
      title: "Epic Planning",
      description: "Plan comprehensive epics with multiple user stories",
      type: "epic" as const,
      icon: IconList,
      color: "green",
    },
    {
      title: "Feature Proposal",
      description: "Propose new features with detailed requirements",
      type: "feature" as const,
      icon: IconSparkles,
      color: "orange",
    },
    {
      title: "Project Proposal",
      description: "Create comprehensive project proposals with full scope",
      type: "project" as const,
      icon: IconBrain,
      color: "purple",
    },
  ];

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "information-gathering":
        return "blue";
      case "story-formation":
        return "green";
      case "epic-creation":
        return "orange";
      case "refinement":
        return "purple";
      default:
        return "gray";
    }
  };

  // Show content generation panel for story/epic phases
  const showContentPanel =
    currentProposal &&
    (currentPhase === "story-formation" ||
      currentPhase === "epic-creation" ||
      currentPhase === "refinement");

  return (
    <Container fluid p={0} h="100vh">
      <Grid gutter={0} h="100%">
        {/* Main Chat Area */}
        <Grid.Col span={sidebarCollapsed ? 12 : showContentPanel ? 6 : 8}>
          <Paper h="100%" style={{ display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <Group
              p="md"
              justify="space-between"
              style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Group>
                <IconBrain size={24} color="var(--mantine-color-blue-6)" />
                <Title order={3}>Enhanced Proposals Assistant</Title>
                {currentProposal && (
                  <>
                    <Badge color={getPhaseColor(currentPhase)} variant="light">
                      {currentPhase.replace("-", " ")}
                    </Badge>
                    <Badge color="gray" variant="outline">
                      {currentProposal.workflowType}
                    </Badge>
                  </>
                )}
              </Group>
              <Group>
                <Tooltip
                  label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
                >
                  <ActionIcon
                    variant="subtle"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  >
                    <IconArrowRight
                      size={16}
                      style={{
                        transform: sidebarCollapsed
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </ActionIcon>
                </Tooltip>
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <ActionIcon variant="subtle">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconRefresh size={14} />}
                      onClick={resetWorkflow}
                    >
                      Reset Workflow
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={resetWorkflow}
                    >
                      Clear Conversation
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Label>Testing Options</Menu.Label>
                    <Menu.Item
                      leftSection={<IconFlask size={14} />}
                      color="orange"
                      onClick={() => {
                        if (currentPhase === "information-gathering") {
                          transitionToNextPhase();
                          notifications.show({
                            title: "Testing Mode",
                            message:
                              "Forced transition to Story Formation phase",
                            color: "orange",
                          });
                        } else {
                          notifications.show({
                            title: "Testing Mode",
                            message: `Already in ${currentPhase} phase`,
                            color: "blue",
                          });
                        }
                      }}
                    >
                      [TEST] Go to Stories
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconFlask size={14} />}
                      color="grape"
                      onClick={() => {
                        // Force transition to epic creation phase
                        if (currentPhase === "information-gathering") {
                          transitionToNextPhase(); // to story-formation
                          setTimeout(() => transitionToNextPhase(), 100); // to epic-creation
                          notifications.show({
                            title: "Testing Mode",
                            message: "Forced transition to Epic Creation phase",
                            color: "grape",
                          });
                        } else if (currentPhase === "story-formation") {
                          transitionToNextPhase();
                          notifications.show({
                            title: "Testing Mode",
                            message: "Forced transition to Epic Creation phase",
                            color: "grape",
                          });
                        } else {
                          notifications.show({
                            title: "Testing Mode",
                            message: `Already in ${currentPhase} phase`,
                            color: "blue",
                          });
                        }
                      }}
                    >
                      [TEST] Go to Epics
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconFlask size={14} />}
                      color="violet"
                      onClick={() => {
                        // Force transition to refinement phase
                        const transitions = [];
                        if (currentPhase === "information-gathering") {
                          transitions.push(() => transitionToNextPhase()); // to story-formation
                          transitions.push(() => transitionToNextPhase()); // to epic-creation
                          transitions.push(() => transitionToNextPhase()); // to refinement
                        } else if (currentPhase === "story-formation") {
                          transitions.push(() => transitionToNextPhase()); // to epic-creation
                          transitions.push(() => transitionToNextPhase()); // to refinement
                        } else if (currentPhase === "epic-creation") {
                          transitions.push(() => transitionToNextPhase()); // to refinement
                        }

                        transitions.forEach((transition, index) => {
                          setTimeout(transition, index * 100);
                        });

                        if (transitions.length > 0) {
                          notifications.show({
                            title: "Testing Mode",
                            message: "Forced transition to Refinement phase",
                            color: "violet",
                          });
                        } else {
                          notifications.show({
                            title: "Testing Mode",
                            message: "Already in refinement phase",
                            color: "blue",
                          });
                        }
                      }}
                    >
                      [TEST] Go to Refinement
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconFlask size={14} />}
                      color="teal"
                      onClick={() => {
                        // Populate sample extracted information for testing
                        const sampleData = {
                          personas: [
                            {
                              id: "persona-1",
                              name: "Sarah the Project Manager",
                              role: "Project Manager",
                              description:
                                "Works with distributed teams across multiple time zones",
                              goals: [
                                "Track project progress",
                                "Manage team workload",
                              ],
                              painPoints: [
                                "Manual status updates",
                                "Lack of visibility",
                              ],
                              behaviors: [
                                "Checks project status multiple times daily",
                                "Prefers visual dashboards over reports",
                              ],
                              extractedFrom: ["test-message-1"],
                            },
                            {
                              id: "persona-2",
                              name: "Mike the Developer",
                              role: "Software Developer",
                              description:
                                "Senior developer who mentors junior team members",
                              goals: [
                                "Focus on coding",
                                "Minimize interruptions",
                              ],
                              painPoints: [
                                "Too many meetings",
                                "Context switching",
                              ],
                              behaviors: [
                                "Prefers asynchronous communication",
                                "Works best in long, uninterrupted blocks",
                              ],
                              extractedFrom: ["test-message-2"],
                            },
                          ],
                          goals: [
                            {
                              id: "goal-1",
                              type: "business" as const,
                              description:
                                "Streamline workflows to reduce administrative overhead",
                              priority: "high" as const,
                              measurable: true,
                              metrics: [
                                "Time saved per week",
                                "Reduced admin tasks",
                              ],
                              extractedFrom: ["test-message-3"],
                            },
                            {
                              id: "goal-2",
                              type: "operational" as const,
                              description:
                                "Provide real-time insights into project status and team capacity",
                              priority: "medium" as const,
                              measurable: true,
                              metrics: ["Dashboard usage", "Decision speed"],
                              extractedFrom: ["test-message-4"],
                            },
                          ],
                          contexts: [
                            {
                              id: "context-1",
                              category: "organizational" as const,
                              title: "Remote Team Environment",
                              description:
                                "Team is distributed across 3 time zones with varying work schedules",
                              impact: "high" as const,
                              extractedFrom: ["test-message-5"],
                            },
                          ],
                          constraints: [
                            {
                              id: "constraint-1",
                              type: "budget" as const,
                              description:
                                "Limited budget for new tools and integrations",
                              severity: "important" as const,
                              extractedFrom: ["test-message-6"],
                            },
                            {
                              id: "constraint-2",
                              type: "technical" as const,
                              description:
                                "Must integrate with existing JIRA and Slack setup",
                              severity: "critical" as const,
                              extractedFrom: ["test-message-7"],
                            },
                          ],
                          assumptions: [
                            {
                              id: "assumption-1",
                              category: "user" as const,
                              description:
                                "Team members will adopt new workflow tools if they save time",
                              confidence: "medium" as const,
                              needsValidation: true,
                              extractedFrom: ["test-message-8"],
                            },
                          ],
                        };

                        updateExtractedInformation(sampleData);
                        notifications.show({
                          title: "Testing Mode",
                          message: "Sample data populated successfully",
                          color: "teal",
                        });
                      }}
                    >
                      [TEST] Add Sample Data
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>

            {/* Messages Area */}
            <Box style={{ flex: 1, position: "relative" }}>
              <LoadingOverlay visible={isExtracting} />

              {!currentProposal ? (
                // Quick Start Screen
                <Stack align="center" justify="center" h="100%" p="xl">
                  <Stack align="center" gap="lg" maw={600}>
                    <IconBrain size={64} color="var(--mantine-color-blue-6)" />
                    <Title order={2} ta="center">
                      Welcome to Enhanced Proposals
                    </Title>
                    <Text ta="center" c="dimmed" size="lg">
                      I'll help you create comprehensive proposals by
                      intelligently gathering information through our
                      conversation. Choose what type of proposal you'd like to
                      create:
                    </Text>

                    <Grid gutter="md" w="100%">
                      {quickStartOptions.map((option) => (
                        <Grid.Col key={option.type} span={6}>
                          <Card
                            withBorder
                            p="md"
                            style={{ cursor: "pointer", height: "100%" }}
                            onClick={() => handleStartNewProposal(option.type)}
                          >
                            <Stack gap="xs" h="100%">
                              <Group>
                                <option.icon
                                  size={24}
                                  color={`var(--mantine-color-${option.color}-6)`}
                                />
                                <Badge color={option.color} variant="light">
                                  {option.type}
                                </Badge>
                              </Group>
                              <Text fw={600}>{option.title}</Text>
                              <Text size="sm" c="dimmed" style={{ flex: 1 }}>
                                {option.description}
                              </Text>
                            </Stack>
                          </Card>
                        </Grid.Col>
                      ))}
                    </Grid>
                  </Stack>
                </Stack>
              ) : (
                // Chat Messages
                <ScrollArea
                  h="100%"
                  p="md"
                  viewportRef={scrollAreaRef}
                  onScrollPositionChange={handleScroll}
                >
                  <Stack gap="md">
                    {messages.map((message) => (
                      <Transition
                        key={message.id}
                        mounted={true}
                        transition="slide-up"
                        duration={300}
                        timingFunction="ease-out"
                      >
                        {(styles) => (
                          <div style={styles}>
                            <MessageBubble
                              message={message}
                              isUser={message.isUser}
                              timestamp={formatTimestampSafe(message.timestamp)}
                            />
                          </div>
                        )}
                      </Transition>
                    ))}

                    {isLoading && (
                      <Group>
                        <Avatar color="blue" radius="xl">
                          <IconRobot size={20} />
                        </Avatar>
                        <Paper
                          p="md"
                          style={{
                            backgroundColor: "var(--mantine-color-gray-1)",
                          }}
                        >
                          <TypingIndicator size="sm" />
                        </Paper>
                      </Group>
                    )}
                  </Stack>
                </ScrollArea>
              )}
            </Box>

            {/* Input Area */}
            {currentProposal && (
              <>
                <Divider />
                <Group p="md" align="flex-end" gap="xs">
                  <TextInput
                    ref={textInputRef}
                    flex={1}
                    placeholder="Share your thoughts, ideas, or ask questions..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    disabled={isLoading}
                    size="lg"
                    radius="md"
                  />
                  <ActionIcon
                    size="lg"
                    radius="md"
                    variant="filled"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    loading={isLoading}
                  >
                    <IconSend size={18} />
                  </ActionIcon>
                </Group>
              </>
            )}
          </Paper>
        </Grid.Col>

        {/* Content Generation Panel - Story/Epic phases */}
        {!sidebarCollapsed && showContentPanel && (
          <Grid.Col span={3}>
            <ContentGenerationPanel />
          </Grid.Col>
        )}

        {/* Information Extraction Sidebar */}
        {!sidebarCollapsed && currentProposal && (
          <Grid.Col span={showContentPanel ? 3 : 4}>
            <InformationExtractionSidebar
              extractedInformation={extractedInformation}
              workflowProgress={workflowProgress}
              isExtracting={isExtracting}
              onTransitionToNextPhase={
                workflowProgress.readyForNextPhase
                  ? transitionToNextPhase
                  : undefined
              }
            />
          </Grid.Col>
        )}
      </Grid>
    </Container>
  );
}

// Message Bubble Component
interface MessageBubbleProps {
  message: EnhancedProposalMessage;
  isUser: boolean;
  timestamp: string;
}

function MessageBubble({ message, isUser, timestamp }: MessageBubbleProps) {
  const maxWidth = "80%";

  return (
    <Group
      justify={isUser ? "flex-end" : "flex-start"}
      align="flex-start"
      gap="xs"
      wrap="nowrap"
    >
      {!isUser && (
        <Avatar color="blue" radius="xl" size="md">
          <IconRobot size={20} />
        </Avatar>
      )}

      <Stack gap={4} maw={maxWidth}>
        <Paper
          p="md"
          radius="lg"
          style={{
            backgroundColor: isUser
              ? "var(--mantine-color-blue-6)"
              : "var(--mantine-color-gray-1)",
            color: isUser ? "white" : "var(--mantine-color-dark-7)",
          }}
        >
          <Text
            size="sm"
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {message.content}
          </Text>
        </Paper>

        <Group gap={4} justify={isUser ? "flex-end" : "flex-start"}>
          <Text size="xs" c="dimmed">
            {timestamp}
          </Text>
          {message.questionCategory && (
            <Badge size="xs" color="gray" variant="light">
              {message.questionCategory}
            </Badge>
          )}
          {message.extractedInfo &&
            Object.keys(message.extractedInfo).length > 0 && (
              <Tooltip label="Information extracted from this message">
                <Badge size="xs" color="green" variant="light">
                  <IconSparkles size={10} />
                </Badge>
              </Tooltip>
            )}
        </Group>
      </Stack>

      {isUser && (
        <Avatar color="cyan" radius="xl" size="md">
          <IconUser size={20} />
        </Avatar>
      )}
    </Group>
  );
}
