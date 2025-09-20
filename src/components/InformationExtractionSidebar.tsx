import React from "react";
import {
  Stack,
  Paper,
  Title,
  Text,
  Badge,
  Group,
  ScrollArea,
  Progress,
  Card,
  Box,
  Tooltip,
  ActionIcon,
  Collapse,
  Button,
} from "@mantine/core";
import {
  IconUser,
  IconBuildingBank,
  IconTarget,
  IconLock,
  IconQuestionMark,
  IconChevronDown,
  IconChevronUp,
  IconInfoCircle,
  IconCheck,
  IconClock,
} from "@tabler/icons-react";
import {
  ExtractedInformation,
  UserPersona,
  BusinessContext,
  ProjectGoal,
  Constraint,
  Assumption,
  WorkflowProgress,
} from "../types/enhanced-proposals";

// Helper functions for color mapping
const getPriorityColor = (priority: "high" | "medium" | "low") => {
  switch (priority) {
    case "high":
      return "red";
    case "medium":
      return "yellow";
    case "low":
      return "gray";
  }
};

const getImpactColor = (impact: "high" | "medium" | "low") => {
  switch (impact) {
    case "high":
      return "red";
    case "medium":
      return "orange";
    case "low":
      return "blue";
  }
};

const getSeverityColor = (severity: "critical" | "important" | "minor") => {
  switch (severity) {
    case "critical":
      return "red";
    case "important":
      return "orange";
    case "minor":
      return "gray";
  }
};

const getConfidenceColor = (confidence: "high" | "medium" | "low") => {
  switch (confidence) {
    case "high":
      return "green";
    case "medium":
      return "yellow";
    case "low":
      return "orange";
  }
};

interface InformationExtractionSidebarProps {
  extractedInformation: ExtractedInformation;
  workflowProgress: WorkflowProgress;
  isExtracting: boolean;
  onTransitionToNextPhase?: () => void;
}

export function InformationExtractionSidebar({
  extractedInformation,
  workflowProgress,
  isExtracting,
  onTransitionToNextPhase,
}: InformationExtractionSidebarProps) {
  const [openSections, setOpenSections] = React.useState<string[]>([
    "progress",
    "personas",
    "contexts",
    "goals",
  ]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "green";
    if (percentage >= 60) return "yellow";
    if (percentage >= 40) return "orange";
    return "red";
  };

  return (
    <Paper
      p="md"
      h="100%"
      style={{ borderLeft: "1px solid var(--mantine-color-gray-3)" }}
    >
      <ScrollArea h="100%" offsetScrollbars>
        <Stack gap="md">
          {/* Header */}
          <Group justify="space-between" align="center">
            <Title order={4}>Extracted Information</Title>
            {isExtracting && (
              <Badge color="blue" variant="light" size="sm">
                <Group gap={4}>
                  <Box
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "var(--mantine-color-blue-6)",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                  Extracting...
                </Group>
              </Badge>
            )}
          </Group>

          {/* Workflow Progress */}
          <Card withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={600}>
                {workflowProgress.currentPhase.charAt(0).toUpperCase() +
                  workflowProgress.currentPhase.slice(1).replace("-", " ")}{" "}
                Phase
              </Text>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => toggleSection("progress")}
              >
                {openSections.includes("progress") ? (
                  <IconChevronUp />
                ) : (
                  <IconChevronDown />
                )}
              </ActionIcon>
            </Group>

            <Collapse in={openSections.includes("progress")}>
              <Stack gap="xs">
                <Progress
                  value={workflowProgress.completionPercentage}
                  color={getCompletionColor(
                    workflowProgress.completionPercentage,
                  )}
                  size="lg"
                  striped
                  animated={isExtracting}
                />
                <Text size="xs" c="dimmed">
                  {workflowProgress.completionPercentage}% Complete
                </Text>

                {workflowProgress.readyForNextPhase &&
                  onTransitionToNextPhase && (
                    <Button
                      size="xs"
                      fullWidth
                      onClick={onTransitionToNextPhase}
                      rightSection={<IconCheck size={14} />}
                    >
                      Ready for Next Phase
                    </Button>
                  )}

                {workflowProgress.missingInformation.length > 0 && (
                  <Card p="xs" bg="yellow.0">
                    <Text size="xs" c="yellow.8" fw={500}>
                      Still need:{" "}
                      {workflowProgress.missingInformation.join(", ")}
                    </Text>
                  </Card>
                )}
              </Stack>
            </Collapse>
          </Card>

          {/* Personas Section */}
          <Card withBorder>
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <IconUser size={16} />
                <Text size="sm" fw={600}>
                  User Personas ({extractedInformation.personas.length})
                </Text>
              </Group>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => toggleSection("personas")}
              >
                {openSections.includes("personas") ? (
                  <IconChevronUp />
                ) : (
                  <IconChevronDown />
                )}
              </ActionIcon>
            </Group>

            <Collapse in={openSections.includes("personas")}>
              <Stack gap="xs">
                {extractedInformation.personas.length === 0 ? (
                  <Text size="xs" c="dimmed" fs="italic">
                    No personas identified yet
                  </Text>
                ) : (
                  extractedInformation.personas.map((persona) => (
                    <PersonaCard key={persona.id} persona={persona} />
                  ))
                )}
              </Stack>
            </Collapse>
          </Card>

          {/* Business Context Section */}
          <Card withBorder>
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <IconBuildingBank size={16} />
                <Text size="sm" fw={600}>
                  Business Context ({extractedInformation.contexts.length})
                </Text>
              </Group>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => toggleSection("contexts")}
              >
                {openSections.includes("contexts") ? (
                  <IconChevronUp />
                ) : (
                  <IconChevronDown />
                )}
              </ActionIcon>
            </Group>

            <Collapse in={openSections.includes("contexts")}>
              <Stack gap="xs">
                {extractedInformation.contexts.length === 0 ? (
                  <Text size="xs" c="dimmed" fs="italic">
                    No business context identified yet
                  </Text>
                ) : (
                  extractedInformation.contexts.map((context) => (
                    <ContextCard key={context.id} context={context} />
                  ))
                )}
              </Stack>
            </Collapse>
          </Card>

          {/* Goals Section */}
          <Card withBorder>
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <IconTarget size={16} />
                <Text size="sm" fw={600}>
                  Goals & Objectives ({extractedInformation.goals.length})
                </Text>
              </Group>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => toggleSection("goals")}
              >
                {openSections.includes("goals") ? (
                  <IconChevronUp />
                ) : (
                  <IconChevronDown />
                )}
              </ActionIcon>
            </Group>

            <Collapse in={openSections.includes("goals")}>
              <Stack gap="xs">
                {extractedInformation.goals.length === 0 ? (
                  <Text size="xs" c="dimmed" fs="italic">
                    No goals identified yet
                  </Text>
                ) : (
                  extractedInformation.goals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))
                )}
              </Stack>
            </Collapse>
          </Card>

          {/* Constraints Section */}
          <Card withBorder>
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <IconLock size={16} />
                <Text size="sm" fw={600}>
                  Constraints ({extractedInformation.constraints.length})
                </Text>
              </Group>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => toggleSection("constraints")}
              >
                {openSections.includes("constraints") ? (
                  <IconChevronUp />
                ) : (
                  <IconChevronDown />
                )}
              </ActionIcon>
            </Group>

            <Collapse in={openSections.includes("constraints")}>
              <Stack gap="xs">
                {extractedInformation.constraints.length === 0 ? (
                  <Text size="xs" c="dimmed" fs="italic">
                    No constraints identified yet
                  </Text>
                ) : (
                  extractedInformation.constraints.map((constraint) => (
                    <ConstraintCard
                      key={constraint.id}
                      constraint={constraint}
                    />
                  ))
                )}
              </Stack>
            </Collapse>
          </Card>

          {/* Assumptions Section */}
          <Card withBorder>
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <IconQuestionMark size={16} />
                <Text size="sm" fw={600}>
                  Assumptions ({extractedInformation.assumptions.length})
                </Text>
              </Group>
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => toggleSection("assumptions")}
              >
                {openSections.includes("assumptions") ? (
                  <IconChevronUp />
                ) : (
                  <IconChevronDown />
                )}
              </ActionIcon>
            </Group>

            <Collapse in={openSections.includes("assumptions")}>
              <Stack gap="xs">
                {extractedInformation.assumptions.length === 0 ? (
                  <Text size="xs" c="dimmed" fs="italic">
                    No assumptions identified yet
                  </Text>
                ) : (
                  extractedInformation.assumptions.map((assumption) => (
                    <AssumptionCard
                      key={assumption.id}
                      assumption={assumption}
                    />
                  ))
                )}
              </Stack>
            </Collapse>
          </Card>

          {/* Last Updated */}
          <Group justify="center">
            <Group gap={4}>
              <IconClock size={12} />
              <Text size="xs" c="dimmed">
                Last updated:{" "}
                {extractedInformation.lastUpdated.toLocaleTimeString()}
              </Text>
            </Group>
          </Group>
        </Stack>
      </ScrollArea>
    </Paper>
  );
}

// Individual card components
function PersonaCard({ persona }: { persona: UserPersona }) {
  return (
    <Card p="xs" bg="blue.0" withBorder>
      <Stack gap={4}>
        <Group justify="space-between">
          <Text size="xs" fw={600}>
            {persona.name}
          </Text>
          <Badge size="xs" color="blue">
            {persona.role}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed" lineClamp={2}>
          {persona.description}
        </Text>
        {(persona.painPoints.length > 0 || persona.goals.length > 0) && (
          <Stack gap={2}>
            {persona.painPoints.length > 0 && (
              <Text size="xs" c="red.7">
                Pain points: {persona.painPoints.length}
              </Text>
            )}
            {persona.goals.length > 0 && (
              <Text size="xs" c="green.7">
                Goals: {persona.goals.length}
              </Text>
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

function ContextCard({ context }: { context: BusinessContext }) {
  return (
    <Card p="xs" bg="orange.0" withBorder>
      <Stack gap={4}>
        <Group justify="space-between">
          <Text size="xs" fw={600}>
            {context.title}
          </Text>
          <Group gap={2}>
            <Badge size="xs" color="orange">
              {context.category}
            </Badge>
            <Badge
              size="xs"
              color={getImpactColor(context.impact)}
              variant="light"
            >
              {context.impact}
            </Badge>
          </Group>
        </Group>
        <Text size="xs" c="dimmed" lineClamp={2}>
          {context.description}
        </Text>
      </Stack>
    </Card>
  );
}

function GoalCard({ goal }: { goal: ProjectGoal }) {
  return (
    <Card p="xs" bg="green.0" withBorder>
      <Stack gap={4}>
        <Group justify="space-between">
          <Group gap={2}>
            <Badge size="xs" color="green">
              {goal.type}
            </Badge>
            <Badge
              size="xs"
              color={getPriorityColor(goal.priority)}
              variant="light"
            >
              {goal.priority}
            </Badge>
          </Group>
          {goal.measurable && (
            <Tooltip label="Measurable goal">
              <IconTarget size={12} color="var(--mantine-color-green-6)" />
            </Tooltip>
          )}
        </Group>
        <Text size="xs" c="dimmed" lineClamp={2}>
          {goal.description}
        </Text>
        {goal.metrics && goal.metrics.length > 0 && (
          <Text size="xs" c="green.7">
            Metrics: {goal.metrics.join(", ")}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

function ConstraintCard({ constraint }: { constraint: Constraint }) {
  return (
    <Card p="xs" bg="red.0" withBorder>
      <Stack gap={4}>
        <Group justify="space-between">
          <Badge size="xs" color="red">
            {constraint.type}
          </Badge>
          <Badge
            size="xs"
            color={getSeverityColor(constraint.severity)}
            variant="light"
          >
            {constraint.severity}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed" lineClamp={2}>
          {constraint.description}
        </Text>
        {constraint.workaround && (
          <Text size="xs" c="blue.7">
            Workaround: {constraint.workaround}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

function AssumptionCard({ assumption }: { assumption: Assumption }) {
  return (
    <Card p="xs" bg="yellow.0" withBorder>
      <Stack gap={4}>
        <Group justify="space-between">
          <Badge size="xs" color="yellow">
            {assumption.category}
          </Badge>
          <Group gap={2}>
            <Badge
              size="xs"
              color={getConfidenceColor(assumption.confidence)}
              variant="light"
            >
              {assumption.confidence}
            </Badge>
            {assumption.needsValidation && (
              <Tooltip label="Needs validation">
                <IconInfoCircle
                  size={12}
                  color="var(--mantine-color-orange-6)"
                />
              </Tooltip>
            )}
          </Group>
        </Group>
        <Text size="xs" c="dimmed" lineClamp={2}>
          {assumption.description}
        </Text>
      </Stack>
    </Card>
  );
}
