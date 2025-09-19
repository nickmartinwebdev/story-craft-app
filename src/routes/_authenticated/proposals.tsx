import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Paper,
  Title,
  Stack,
  Group,
  Button,
  TextInput,
  ScrollArea,
  Box,
  Text,
  Avatar,
  ActionIcon,
  Divider,
  Transition,
  Tabs,
  Badge,
  Menu,
  Tooltip,
} from "@mantine/core";
import {
  IconSend,
  IconUser,
  IconRobot,
  IconTrash,
  IconDeviceFloppy,
  IconList,
  IconMessageCircle,
  IconDots,
} from "@tabler/icons-react";
import React, {
  useState,
  useMemo,
  useRef,
  useLayoutEffect,
  useEffect,
} from "react";
import { useAuth } from "../../auth/context";
import { useProposals } from "../../contexts/ProposalsContext";
import { TypingIndicator } from "../../components/TypingIndicator";
import { SavedProposalsList } from "../../components/SavedProposalsList";
import { ProposalSaveDialog } from "../../components/ProposalSaveDialog";
import { SavedProposal, ProposalMessage } from "../../types/proposals";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

export const Route = createFileRoute("/_authenticated/proposals")({
  component: ProposalsPage,
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

function ProposalsPage() {
  const {} = useAuth();
  const {
    currentProposal,
    createNewProposal,
    updateCurrentProposalMessages,
    loadProposal,
  } = useProposals();

  const [activeTab, setActiveTab] = useState<"chat" | "saved">("chat");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveDialogOpened, { open: openSaveDialog, close: closeSaveDialog }] =
    useDisclosure(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Memoize default messages to prevent recreation on every render
  const defaultMessages = useMemo(
    () => [
      {
        id: "1",
        content:
          "🚀 **Context7-Powered Proposals Assistant**\n\nI'm your AI assistant with Context7-inspired intelligence for creating world-class proposals that get approved and funded.",
        isUser: false,
        timestamp: new Date(),
      },
      {
        id: "2",
        content:
          "✨ **Smart Capabilities**:\n• **Context-Aware Analysis**: I analyze your input patterns for targeted advice\n• **Framework-Based Guidance**: Strategic, financial, technical, and operational insights\n• **Real-World Examples**: Industry best practices and proven methodologies\n• **Risk Intelligence**: Proactive identification and mitigation strategies\n\n💡 **Pro Tip**: The more specific you are, the more targeted my guidance becomes!\n\nWhat kind of proposal challenge can I help you solve?",
        isUser: false,
        timestamp: new Date(),
      },
    ],
    [],
  );

  // Always ensure we have a current proposal with messages and normalize timestamps
  const messages = useMemo(() => {
    const rawMessages = currentProposal?.messages || defaultMessages;
    // Ensure all message timestamps are proper Date objects
    return rawMessages.map((message) => {
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
  }, [currentProposal?.messages, defaultMessages]);

  // Use refs to track scroll behavior
  const shouldAutoScrollRef = useRef(true);
  const lastMessageCountRef = useRef(messages.length);
  const userScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize proposal on mount if none exists
  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (!currentProposal && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      createNewProposal();
    }
  }, [currentProposal, createNewProposal]);

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
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ProposalMessage = {
      id: `${Date.now()}_user`,
      content: inputValue.trim(),
      isUser: true,
      timestamp: new Date(Date.now()),
    };

    const updatedMessages = [...messages, userMessage];
    setInputValue("");
    setIsLoading(true);

    // Ensure all message timestamps are Date objects before updating
    const normalizedMessages = updatedMessages.map((message) => ({
      ...message,
      timestamp:
        message.timestamp instanceof Date
          ? message.timestamp
          : new Date(message.timestamp || Date.now()),
    }));

    // Update current proposal with new messages, or create if none exists
    if (currentProposal) {
      updateCurrentProposalMessages(normalizedMessages);
    } else {
      createNewProposal();
      // Use setTimeout to ensure the new proposal is created before updating messages
      setTimeout(() => {
        updateCurrentProposalMessages(normalizedMessages);
      }, 0);
    }

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

    // Simulate AI response after a delay
    setTimeout(
      () => {
        const aiResponse = generateMockResponse(userMessage.content);
        const aiMessage: ProposalMessage = {
          id: `${Date.now()}_ai`,
          content: aiResponse,
          isUser: false,
          timestamp: new Date(Date.now()),
        };

        const finalMessages = [...updatedMessages, aiMessage];
        setIsLoading(false);

        // Ensure all final message timestamps are Date objects
        const normalizedFinalMessages = finalMessages.map((message) => ({
          ...message,
          timestamp:
            message.timestamp instanceof Date
              ? message.timestamp
              : new Date(message.timestamp || Date.now()),
        }));

        // Update current proposal with final messages, or create if none exists
        if (currentProposal) {
          updateCurrentProposalMessages(normalizedFinalMessages);
        } else {
          // If no current proposal exists at this point, something went wrong
          // Just create a new proposal with the final messages
          createNewProposal();
          setTimeout(() => {
            updateCurrentProposalMessages(normalizedFinalMessages);
          }, 0);
        }

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
  };

  const clearConversation = () => {
    // Update current proposal with default messages, or create if none exists
    if (currentProposal) {
      updateCurrentProposalMessages(defaultMessages);
    } else {
      createNewProposal();
    }
  };

  const handleNewProposal = () => {
    createNewProposal();
    setActiveTab("chat");
  };

  const handleSelectProposal = (proposal: SavedProposal) => {
    loadProposal(proposal.id);
    setActiveTab("chat");
  };

  const handleSaveProposal = async () => {
    if (messages.length <= 2) {
      notifications.show({
        title: "Nothing to Save",
        message: "Start a conversation before saving your proposal",
        color: "yellow",
      });
      return;
    }

    // Current proposal should always exist, open save dialog
    openSaveDialog();
  };

  const generateMockResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Context7-inspired intelligent contextual analysis
    const detectContext = (): keyof typeof contextResponses => {
      const contexts: Record<string, string[]> = {
        budget: [
          "budget",
          "cost",
          "money",
          "funding",
          "price",
          "expense",
          "roi",
          "investment",
        ],
        timeline: [
          "timeline",
          "schedule",
          "deadline",
          "time",
          "duration",
          "milestone",
          "phase",
        ],
        team: [
          "team",
          "people",
          "staff",
          "resource",
          "personnel",
          "hire",
          "skill",
          "expertise",
        ],
        risk: [
          "risk",
          "challenge",
          "problem",
          "issue",
          "concern",
          "threat",
          "vulnerability",
        ],
        technology: [
          "tech",
          "system",
          "software",
          "platform",
          "architecture",
          "framework",
          "api",
        ],
        market: [
          "market",
          "competition",
          "customer",
          "user",
          "client",
          "audience",
          "segment",
        ],
        strategy: [
          "strategy",
          "approach",
          "methodology",
          "framework",
          "model",
          "plan",
        ],
        metrics: [
          "metric",
          "measure",
          "kpi",
          "analytics",
          "data",
          "track",
          "performance",
        ],
      };

      for (const [context, keywords] of Object.entries(contexts)) {
        if (keywords.some((keyword) => input.includes(keyword))) {
          return context as keyof typeof contextResponses;
        }
      }
      return "general";
    };

    const contextResponses = {
      budget: `💰 **Budget Analysis Framework**

Based on your input, here's a strategic approach to budget planning:

**📊 Cost Structure Breakdown:**
• **Direct Costs**: Personnel (60-70%), Technology (15-20%), Operations (10-15%)
• **Indirect Costs**: Overhead, Administrative, Compliance (5-10%)
• **Contingency**: 10-20% buffer for unforeseen circumstances

**🎯 ROI Projections:**
• **Year 1**: Initial investment recovery timeline
• **Year 2-3**: Break-even and profitability targets
• **Long-term**: Sustainable growth and scaling metrics

**💡 Cost Optimization Strategies:**
• Phased implementation to spread costs
• Resource sharing and economies of scale
• Technology automation to reduce operational expenses

Would you like me to dive deeper into any specific budget component or help you create detailed financial projections?`,

      timeline: `⏱️ **Project Timeline Strategy**

Here's a Context7-inspired timeline framework:

**🚀 Phase-Based Approach:**
• **Discovery & Planning** (Weeks 1-4): Requirements, stakeholder alignment
• **Design & Architecture** (Weeks 5-8): Technical specifications, prototyping
• **Development** (Weeks 9-20): Iterative build with weekly sprints
• **Testing & QA** (Weeks 21-24): Comprehensive testing, bug fixes
• **Deployment** (Weeks 25-26): Production rollout, monitoring setup

**🎯 Critical Path Analysis:**
• Dependencies mapping and risk mitigation
• Resource allocation and capacity planning
• Milestone checkpoints and go/no-go decisions

**⚡ Acceleration Strategies:**
• Parallel workstreams where possible
• MVP approach for faster validation
• Agile methodologies for flexibility

What specific timeline constraints or milestones should we prioritize?`,

      team: `👥 **Team Structure & Resource Planning**

Strategic team composition based on your requirements:

**🎯 Core Team Roles:**
• **Project Lead**: Overall coordination and stakeholder management
• **Technical Architect**: System design and technology decisions
• **Development Team**: Frontend, Backend, DevOps specialists
• **Quality Assurance**: Testing and validation experts
• **Product Owner**: Requirements and user experience focus

**📈 Scaling Strategy:**
• **Phase 1**: Minimal viable team (3-5 people)
• **Phase 2**: Expansion based on workload (6-10 people)
• **Phase 3**: Specialized roles as needed (10+ people)

**💡 Team Success Factors:**
• Clear role definitions and responsibilities
• Regular communication and collaboration protocols
• Skill development and cross-training opportunities
• Performance metrics and recognition systems

What specific skills or team dynamics are most critical for your proposal?`,

      risk: `⚠️ **Risk Assessment & Mitigation Matrix**

Comprehensive risk analysis framework:

**🔴 High-Impact Risks:**
• **Technical**: Architecture scalability, technology obsolescence
• **Market**: Competition, changing customer needs
• **Resource**: Key personnel departure, budget overruns
• **Regulatory**: Compliance changes, legal requirements

**🟡 Medium-Impact Risks:**
• **Operational**: Process inefficiencies, vendor dependencies
• **Timeline**: Scope creep, integration challenges
• **Quality**: Testing gaps, performance issues

**🟢 Mitigation Strategies:**
• **Prevention**: Thorough planning, redundancy, documentation
• **Detection**: Monitoring systems, regular reviews, KPIs
• **Response**: Contingency plans, escalation procedures
• **Recovery**: Backup systems, alternative approaches

**📊 Risk Monitoring:**
• Weekly risk register reviews
• Quantitative impact assessments
• Proactive communication with stakeholders

Which risks are you most concerned about, and what mitigation approaches interest you?`,

      technology: `⚡ **Technology Strategy & Architecture**

Modern technology framework for your proposal:

**🏗️ Architecture Principles:**
• **Scalability**: Horizontal scaling, microservices architecture
• **Reliability**: 99.9% uptime, disaster recovery, monitoring
• **Security**: Zero-trust model, encryption, regular audits
• **Performance**: Sub-second response times, caching strategies

**💻 Technology Stack Recommendations:**
• **Frontend**: React/Next.js, TypeScript, modern UI libraries
• **Backend**: Node.js/Python, REST/GraphQL APIs, containerization
• **Database**: PostgreSQL/MongoDB, caching with Redis
• **Infrastructure**: AWS/GCP, Docker, Kubernetes, CI/CD pipelines

**🔄 Integration Strategy:**
• API-first design for maximum flexibility
• Event-driven architecture for real-time updates
• Third-party service integrations and webhooks

**📈 Future-Proofing:**
• Modular design for easy updates
• Cloud-native approaches for scalability
• AI/ML integration capabilities

What specific technology challenges or requirements should we address in detail?`,

      market: `📈 **Market Analysis & Positioning Strategy**

Strategic market framework for your proposal:

**🎯 Target Market Segmentation:**
• **Primary Segment**: Core customer demographics and needs
• **Secondary Segments**: Growth opportunities and niches
• **Market Size**: TAM, SAM, SOM analysis with growth projections

**🏆 Competitive Landscape:**
• **Direct Competitors**: Feature comparison, pricing analysis
• **Indirect Competitors**: Alternative solutions and substitutes
• **Competitive Advantages**: Unique value propositions, differentiators

**📊 Go-to-Market Strategy:**
• **Launch Plan**: Phased rollout, beta testing, feedback loops
• **Marketing Channels**: Digital marketing, partnerships, PR
• **Sales Strategy**: Pricing models, customer acquisition funnels

**🔮 Market Trends:**
• Industry growth drivers and emerging opportunities
• Technology disruptions and their implications
• Customer behavior shifts and preferences

Which market aspects would you like to explore further for your proposal?`,

      strategy: `🎯 **Strategic Framework & Methodology**

Comprehensive strategic approach for your proposal:

**📋 Strategic Planning Process:**
• **Vision & Mission**: Clear purpose and long-term goals
• **SWOT Analysis**: Strengths, weaknesses, opportunities, threats
• **Objectives**: SMART goals with measurable outcomes
• **Action Plans**: Detailed implementation roadmap

**💡 Strategic Models:**
• **Blue Ocean Strategy**: Creating uncontested market space
• **Lean Startup**: Build-measure-learn cycles for validation
• **Agile Strategy**: Adaptive planning and continuous improvement
• **Design Thinking**: User-centered problem-solving approach

**📈 Success Metrics:**
• **Leading Indicators**: Early signals of progress
• **Lagging Indicators**: Final outcome measurements
• **Balanced Scorecard**: Financial, customer, process, learning perspectives

**🔄 Strategic Review Cycle:**
• Monthly progress assessments
• Quarterly strategic reviews
• Annual strategic planning updates

What strategic challenges or opportunities should we focus on in your proposal?`,

      metrics: `📊 **Metrics & Performance Framework**

Data-driven measurement strategy for your proposal:

**🎯 Key Performance Indicators (KPIs):**
• **Business Metrics**: Revenue, profit margins, market share
• **Operational Metrics**: Efficiency, productivity, quality scores
• **Customer Metrics**: Satisfaction, retention, lifetime value
• **Technical Metrics**: Performance, reliability, security scores

**📈 Analytics Architecture:**
• **Data Collection**: Automated tracking, user behavior analytics
• **Data Processing**: Real-time dashboards, reporting systems
• **Data Analysis**: Trend analysis, predictive modeling
• **Data Action**: Insights-driven decision making

**🔍 Measurement Strategy:**
• **Baseline Establishment**: Current state assessment
• **Target Setting**: Realistic and ambitious goals
• **Progress Tracking**: Regular monitoring and reporting
• **Course Correction**: Data-driven adjustments

**📋 Reporting Framework:**
• **Daily**: Operational dashboards for immediate insights
• **Weekly**: Progress reports for team alignment
• **Monthly**: Executive summaries for stakeholder updates
• **Quarterly**: Strategic reviews and planning adjustments

Which specific metrics or measurement approaches would be most valuable for your proposal?`,

      general: `🚀 **Context7-Powered Proposal Intelligence**

I'm analyzing your input to provide targeted guidance. Here's how I can help:

**🧠 Smart Analysis Capabilities:**
• **Context Detection**: I identify key themes in your proposals (budget, timeline, team, risks, etc.)
• **Framework Application**: I apply proven methodologies and best practices
• **Strategic Insights**: I provide industry-specific recommendations and examples

**💡 Proposal Enhancement Areas:**
• **Structure & Flow**: Logical organization and compelling narrative
• **Evidence & Support**: Data, case studies, and credible backing
• **Risk Mitigation**: Proactive problem identification and solutions
• **Implementation Plan**: Clear roadmap with milestones and deliverables

**🎯 Next Steps Recommendations:**
1. **Define Scope**: Clarify your proposal's main objectives and boundaries
2. **Identify Stakeholders**: Map key decision-makers and influencers
3. **Gather Requirements**: Collect detailed specifications and constraints
4. **Develop Strategy**: Create a comprehensive approach and methodology

**Questions to Consider:**
• What's the primary goal of your proposal?
• Who are the key stakeholders and decision-makers?
• What constraints or challenges do you anticipate?
• How will success be measured and evaluated?

Please share more details about your specific proposal, and I'll provide more targeted guidance based on Context7's intelligent analysis framework!`,
    };

    const context = detectContext();
    return contextResponses[context] || contextResponses.general;
  };

  const TabsContent = () => {
    if (activeTab === "saved") {
      return (
        <SavedProposalsList
          onSelectProposal={handleSelectProposal}
          onCreateNew={handleNewProposal}
        />
      );
    }

    return (
      <Paper
        withBorder
        shadow="sm"
        radius="md"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {/* Chat Header */}
        <Box p="md" style={{ borderBottom: "1px solid #e9ecef" }}>
          <Group justify="space-between" align="center">
            <Group>
              <Title order={4}>
                {currentProposal ? currentProposal.title : "New Proposal"}
              </Title>
              {currentProposal && (
                <Badge variant="light" size="sm">
                  {currentProposal.status}
                </Badge>
              )}
            </Group>
            <Group>
              <Tooltip label="Save Proposal">
                <ActionIcon
                  variant="light"
                  color="blue"
                  onClick={handleSaveProposal}
                  disabled={isLoading}
                >
                  <IconDeviceFloppy size={16} />
                </ActionIcon>
              </Tooltip>
              <Menu shadow="md" width={160}>
                <Menu.Target>
                  <ActionIcon variant="subtle">
                    <IconDots size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconTrash size={14} />}
                    onClick={clearConversation}
                    disabled={isLoading}
                  >
                    Clear Chat
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </Box>

        {/* Chat Messages */}
        <ScrollArea
          ref={scrollAreaRef}
          style={{ flex: 1, minHeight: 0 }}
          p="md"
          scrollbars="y"
          onScrollPositionChange={handleScroll}
          onClick={() => {
            // Maintain input focus when clicking in scroll area
            if (textInputRef.current && !isLoading) {
              textInputRef.current.focus();
            }
          }}
        >
          <Stack gap="md">
            {messages.length === 2 && (
              <Box
                p="md"
                style={{
                  backgroundColor: "#e7f5ff",
                  borderRadius: "12px",
                  border: "1px solid #74c0fc",
                }}
              >
                <Text size="sm" fw={500} mb="sm" c="blue.7">
                  💡 Context7-Inspired Quick Starts:
                </Text>
                <Stack gap="xs">
                  {[
                    "Create a Next.js middleware proposal that checks JWT tokens and handles authentication flows",
                    "Design a microservices architecture proposal with Docker containerization and API gateway",
                    "Develop a machine learning model deployment proposal using AWS SageMaker and real-time inference",
                    "Propose a React Native mobile app with offline-first architecture and data synchronization",
                    "Plan a database migration proposal from MongoDB to PostgreSQL with zero downtime strategy",
                    "Create a DevOps transformation proposal implementing CI/CD pipelines with GitHub Actions",
                  ].map((starter, index) => (
                    <Button
                      key={index}
                      variant="light"
                      size="sm"
                      style={{
                        justifyContent: "flex-start",
                        height: "auto",
                        padding: "8px 12px",
                      }}
                      onClick={() => {
                        setInputValue(starter);
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      disabled={isLoading}
                    >
                      <Text size="xs" style={{ textAlign: "left" }}>
                        {starter}
                      </Text>
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}
            {messages.map((message, index) => (
              <Transition
                key={message.id}
                mounted={true}
                transition="slide-up"
                duration={300}
                timingFunction="ease"
                keepMounted={false}
              >
                {(styles) => (
                  <Group
                    style={{
                      ...styles,
                      animationDelay: `${index * 50}ms`,
                    }}
                    align="flex-start"
                    gap="sm"
                    justify={message.isUser ? "flex-end" : "flex-start"}
                  >
                    {!message.isUser && (
                      <Avatar color="blue" radius="xl" size="sm">
                        <IconRobot size={16} />
                      </Avatar>
                    )}

                    <Box
                      style={{
                        maxWidth: "70%",
                        backgroundColor: message.isUser ? "#2196f3" : "#f8f9fa",
                        color: message.isUser ? "white" : "inherit",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        borderTopLeftRadius: !message.isUser ? "4px" : "12px",
                        borderTopRightRadius: message.isUser ? "4px" : "12px",
                        boxShadow: message.isUser
                          ? "0 2px 8px rgba(33, 150, 243, 0.3)"
                          : "0 2px 8px rgba(0, 0, 0, 0.1)",
                        transform: "translateY(0)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Text
                        size="sm"
                        style={{
                          wordBreak: "break-word",
                          whiteSpace: "pre-line",
                          lineHeight: 1.5,
                        }}
                      >
                        {message.content}
                      </Text>
                      <Text
                        size="xs"
                        c={message.isUser ? "rgba(255,255,255,0.7)" : "dimmed"}
                        mt={4}
                      >
                        {formatTimestampSafe(message.timestamp)}
                      </Text>
                    </Box>

                    {message.isUser && (
                      <Avatar color="gray" radius="xl" size="sm">
                        <IconUser size={16} />
                      </Avatar>
                    )}
                  </Group>
                )}
              </Transition>
            ))}

            <Transition mounted={isLoading} transition="fade" duration={200}>
              {(styles) => (
                <Group style={styles} align="flex-start" gap="sm">
                  <Avatar color="blue" radius="xl" size="sm">
                    <IconRobot size={16} />
                  </Avatar>
                  <Box
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      borderTopLeftRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Text size="sm" c="dimmed">
                      AI is thinking
                    </Text>
                    <TypingIndicator size="sm" />
                  </Box>
                </Group>
              )}
            </Transition>
          </Stack>
        </ScrollArea>

        <Divider />

        {/* Message Input */}
        <Box
          p="md"
          style={{ backgroundColor: "#f8f9fa", borderTop: "1px solid #e9ecef" }}
        >
          <Group gap="sm">
            <TextInput
              ref={textInputRef}
              flex={1}
              placeholder={
                isLoading
                  ? "AI is responding..."
                  : "Ask me anything about your proposal..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.currentTarget.value)}
              onKeyPress={handleKeyPress}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              disabled={isLoading}
              size="md"
              radius="xl"
              autoFocus
              styles={{
                input: {
                  backgroundColor: "white",
                  border: "2px solid #e9ecef",
                  "&:focus": {
                    borderColor: "#2196f3 !important",
                    backgroundColor: "white",
                  },
                  "&:hover": {
                    borderColor: "#2196f3",
                  },
                },
              }}
            />
            <ActionIcon
              size="lg"
              radius="xl"
              color="blue"
              variant="filled"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              style={{
                transition: "transform 0.2s ease",
                transform:
                  !inputValue.trim() || isLoading ? "scale(0.95)" : "scale(1)",
              }}
            >
              <IconSend size={18} />
            </ActionIcon>
          </Group>
        </Box>
      </Paper>
    );
  };

  return (
    <Container size="xl" py="md" style={{ height: "100%" }}>
      <Stack gap="lg" style={{ height: "100%" }}>
        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value as "chat" | "saved")}
        >
          <Tabs.List>
            <Tabs.Tab
              value="chat"
              leftSection={<IconMessageCircle size={16} />}
            >
              Proposal Chat
            </Tabs.Tab>
            <Tabs.Tab value="saved" leftSection={<IconList size={16} />}>
              Saved Proposals
            </Tabs.Tab>
          </Tabs.List>

          <Box style={{ flex: 1, minHeight: 0, marginTop: 16 }}>
            <TabsContent />
          </Box>
        </Tabs>
      </Stack>

      <ProposalSaveDialog opened={saveDialogOpened} onClose={closeSaveDialog} />
    </Container>
  );
}
