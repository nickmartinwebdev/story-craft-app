import { useState } from "react";
import {
  Card,
  Group,
  Text,
  Badge,
  Stack,
  ActionIcon,
  TextInput,
  Textarea,
  Box,
  Paper,
  Tooltip,
  ScrollArea,
} from "@mantine/core";
import {
  IconEdit,
  IconCheck,
  IconX,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { Epic, UserStory } from "../../types/enhanced-proposals";

interface EpicCardProps {
  epic: Epic;
  userStories?: UserStory[];
  onUpdate?: (updates: Partial<Epic>) => void;
  isEditable?: boolean;
  compact?: boolean;
}

export function EpicCard({
  epic,
  userStories = [],
  onUpdate,
  isEditable = false,
  compact = false,
}: EpicCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEpic, setEditedEpic] = useState(epic);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedEpic);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedEpic(epic);
    setIsEditing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "small":
        return "green";
      case "medium":
        return "yellow";
      case "large":
        return "orange";
      case "extra-large":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "green";
      case "refined":
        return "blue";
      case "draft":
        return "gray";
      default:
        return "gray";
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme.toLowerCase()) {
      case "user management":
        return "👥";
      case "technical foundation":
        return "🔧";
      case "reporting & analytics":
        return "📊";
      case "system integration":
        return "🔗";
      case "security & compliance":
        return "🔒";
      case "administration":
        return "⚙️";
      case "user experience":
        return "✨";
      case "management & oversight":
        return "📋";
      default:
        return "📝";
    }
  };

  if (compact) {
    return (
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Group justify="space-between" align="flex-start" mb="sm">
          <Group gap="xs">
            <Text size="lg">{getThemeIcon(epic.theme)}</Text>
            <Text fw={600} size="md">
              {epic.title}
            </Text>
          </Group>
          <Group gap="xs">
            <Badge
              color={getPriorityColor(epic.priority)}
              variant="light"
              size="xs"
            >
              {epic.priority}
            </Badge>
            <Badge
              color={getEffortColor(epic.estimatedEffort)}
              variant="light"
              size="xs"
            >
              {epic.estimatedEffort}
            </Badge>
          </Group>
        </Group>

        <Text size="sm" c="dimmed" mb="sm" lineClamp={2}>
          {epic.description}
        </Text>

        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            {epic.userStories.length} stories
          </Text>
          <Text size="xs" fw={500} c="dimmed">
            {epic.theme}
          </Text>
        </Group>
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" align="flex-start" mb="md">
        <Box flex={1}>
          <Group gap="md" mb="sm">
            <Text size="xl">{getThemeIcon(epic.theme)}</Text>
            {isEditing ? (
              <TextInput
                value={editedEpic.title}
                onChange={(e) =>
                  setEditedEpic({ ...editedEpic, title: e.target.value })
                }
                size="lg"
                fw={700}
                flex={1}
              />
            ) : (
              <Text fw={700} size="xl">
                {epic.title}
              </Text>
            )}
          </Group>

          <Group gap="xs" mb="md">
            <Badge color={getPriorityColor(epic.priority)} variant="light">
              {epic.priority.toUpperCase()}
            </Badge>
            <Badge color={getEffortColor(epic.estimatedEffort)} variant="light">
              {epic.estimatedEffort.toUpperCase()}
            </Badge>
            <Badge color={getStatusColor(epic.status)} variant="light">
              {epic.status.toUpperCase()}
            </Badge>
            <Badge color="blue" variant="light">
              {epic.userStories.length} STORIES
            </Badge>
          </Group>
        </Box>

        <Group gap="xs" ml="md">
          {isEditable && (
            <>
              {isEditing ? (
                <>
                  <Tooltip label="Save changes">
                    <ActionIcon
                      onClick={handleSave}
                      color="green"
                      variant="light"
                      size="sm"
                    >
                      <IconCheck size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Cancel editing">
                    <ActionIcon
                      onClick={handleCancel}
                      color="red"
                      variant="light"
                      size="sm"
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Tooltip>
                </>
              ) : (
                <Tooltip label="Edit epic">
                  <ActionIcon
                    onClick={() => setIsEditing(true)}
                    color="gray"
                    variant="light"
                    size="sm"
                  >
                    <IconEdit size={14} />
                  </ActionIcon>
                </Tooltip>
              )}
            </>
          )}
          <ActionIcon
            onClick={() => setIsExpanded(!isExpanded)}
            color="gray"
            variant="light"
            size="sm"
          >
            {isExpanded ? (
              <IconChevronUp size={14} />
            ) : (
              <IconChevronDown size={14} />
            )}
          </ActionIcon>
        </Group>
      </Group>

      {/* Epic Summary */}
      <Paper p="md" bg="gray.0" radius="md" mb="md">
        {isEditing ? (
          <Stack gap="sm">
            <Box>
              <Text size="sm" fw={500} mb={4}>
                Description
              </Text>
              <Textarea
                value={editedEpic.description}
                onChange={(e) =>
                  setEditedEpic({ ...editedEpic, description: e.target.value })
                }
                size="sm"
                rows={2}
              />
            </Box>
            <Box>
              <Text size="sm" fw={500} mb={4}>
                Goal
              </Text>
              <Textarea
                value={editedEpic.goal}
                onChange={(e) =>
                  setEditedEpic({ ...editedEpic, goal: e.target.value })
                }
                size="sm"
                rows={2}
              />
            </Box>
            <Box>
              <Text size="sm" fw={500} mb={4}>
                Business Value
              </Text>
              <Textarea
                value={editedEpic.businessValue}
                onChange={(e) =>
                  setEditedEpic({
                    ...editedEpic,
                    businessValue: e.target.value,
                  })
                }
                size="sm"
                rows={2}
              />
            </Box>
          </Stack>
        ) : (
          <Stack gap="xs">
            <Box>
              <Text fw={600} c="blue.7" size="sm">
                Description:
              </Text>
              <Text c="dimmed" size="sm" mt={2}>
                {epic.description}
              </Text>
            </Box>
            <Box>
              <Text fw={600} c="green.7" size="sm">
                Goal:
              </Text>
              <Text c="dimmed" size="sm" mt={2}>
                {epic.goal}
              </Text>
            </Box>
            <Box>
              <Text fw={600} c="violet.7" size="sm">
                Business Value:
              </Text>
              <Text c="dimmed" size="sm" mt={2}>
                {epic.businessValue}
              </Text>
            </Box>
          </Stack>
        )}
      </Paper>

      {/* Expanded Details */}
      {isExpanded && (
        <Stack gap="md">
          {/* User Stories */}
          <Box>
            <Text size="sm" fw={500} mb="sm">
              User Stories ({epic.userStories.length})
            </Text>
            {epic.userStories.length > 0 ? (
              <ScrollArea.Autosize mah={192}>
                <Stack gap="xs">
                  {epic.userStories.map((storyId, index) => {
                    const story = userStories.find((s) => s.id === storyId);
                    return (
                      <Paper
                        key={storyId}
                        p="sm"
                        bg="gray.0"
                        radius="sm"
                        withBorder
                        style={{
                          borderLeft: `3px solid var(--mantine-color-blue-4)`,
                        }}
                      >
                        <Group gap="xs" align="flex-start">
                          <Text size="xs" c="dimmed" fw={500} mt={1}>
                            {index + 1}.
                          </Text>
                          <Box flex={1}>
                            {story ? (
                              <Box>
                                <Text size="sm" fw={500}>
                                  {story.title}
                                </Text>
                                <Text size="xs" c="dimmed" mt={2}>
                                  As a {story.asA}, I want {story.iWant}
                                </Text>
                              </Box>
                            ) : (
                              <Text size="sm" c="dimmed">
                                Story ID: {storyId}
                              </Text>
                            )}
                          </Box>
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              </ScrollArea.Autosize>
            ) : (
              <Text size="sm" c="dimmed" fs="italic">
                No user stories assigned
              </Text>
            )}
          </Box>

          {/* Success Metrics */}
          {epic.successMetrics.length > 0 && (
            <Box>
              <Text size="sm" fw={500} mb="sm">
                Success Metrics
              </Text>
              <Stack gap="xs">
                {epic.successMetrics.map((metric, index) => (
                  <Group key={index} gap="xs" align="flex-start">
                    <Text c="green.5" size="xs" mt={1}>
                      ✓
                    </Text>
                    <Text size="sm" c="dimmed">
                      {metric}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Box>
          )}

          {/* Theme and Classification */}
          <Group grow>
            <Box>
              <Text size="sm" fw={500} mb="sm">
                Theme
              </Text>
              <Group gap="xs">
                <Text size="lg">{getThemeIcon(epic.theme)}</Text>
                <Text size="sm" c="dimmed">
                  {epic.theme}
                </Text>
              </Group>
            </Box>

            <Box>
              <Text size="sm" fw={500} mb="sm">
                Effort Estimate
              </Text>
              <Badge
                color={getEffortColor(epic.estimatedEffort)}
                variant="light"
                size="sm"
              >
                {epic.estimatedEffort.charAt(0).toUpperCase() +
                  epic.estimatedEffort.slice(1).replace("-", " ")}
              </Badge>
            </Box>
          </Group>

          {/* Related Information */}
          <Paper p="sm" bg="gray.0" radius="sm">
            <Group justify="space-between" align="center">
              <Text size="xs" c="dimmed">
                <Text component="span" fw={500}>
                  Personas:
                </Text>{" "}
                {epic.relatedPersonas.length}
              </Text>
              <Text size="xs" c="dimmed">
                <Text component="span" fw={500}>
                  Goals:
                </Text>{" "}
                {epic.relatedGoals.length}
              </Text>
              <Text size="xs" c="dimmed">
                <Text component="span" fw={500}>
                  Constraints:
                </Text>{" "}
                {epic.constraints.length}
              </Text>
              <Text size="xs" c="dimmed">
                <Text component="span" fw={500}>
                  Assumptions:
                </Text>{" "}
                {epic.assumptions.length}
              </Text>
            </Group>
          </Paper>
        </Stack>
      )}
    </Card>
  );
}
