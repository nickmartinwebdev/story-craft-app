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
} from "@mantine/core";
import {
  IconEdit,
  IconCheck,
  IconX,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { UserStory } from "../../types/enhanced-proposals";

interface StoryCardProps {
  story: UserStory;
  onUpdate?: (updates: Partial<UserStory>) => void;
  isEditable?: boolean;
  compact?: boolean;
}

export function StoryCard({
  story,
  onUpdate,
  isEditable = false,
  compact = false,
}: StoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStory, setEditedStory] = useState(story);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedStory);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedStory(story);
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
      case "xs":
        return "blue";
      case "s":
        return "cyan";
      case "m":
        return "indigo";
      case "l":
        return "violet";
      case "xl":
        return "grape";
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

  if (compact) {
    return (
      <Card shadow="xs" padding="md" radius="md" withBorder>
        <Group justify="space-between" mb="xs">
          <Text fw={500} size="sm" lineClamp={1}>
            {story.title}
          </Text>
          <Group gap="xs">
            <Badge color={getPriorityColor(story.priority)} size="xs">
              {story.priority}
            </Badge>
            <Badge color={getEffortColor(story.estimatedEffort)} size="xs">
              {story.estimatedEffort.toUpperCase()}
            </Badge>
          </Group>
        </Group>
        <Stack gap="xs">
          <Text size="xs" c="dimmed">
            <Text component="span" fw={500}>
              As a
            </Text>{" "}
            {story.asA}
          </Text>
          <Text size="xs" c="dimmed">
            <Text component="span" fw={500}>
              I want
            </Text>{" "}
            {story.iWant}
          </Text>
          <Text size="xs" c="dimmed">
            <Text component="span" fw={500}>
              So that
            </Text>{" "}
            {story.soThat}
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" align="flex-start" mb="md">
        <Box flex={1}>
          {isEditing ? (
            <TextInput
              value={editedStory.title}
              onChange={(e) =>
                setEditedStory({ ...editedStory, title: e.target.value })
              }
              size="md"
              fw={600}
              mb="sm"
            />
          ) : (
            <Text fw={600} size="lg" mb="sm">
              {story.title}
            </Text>
          )}

          <Group gap="xs" mb="md">
            <Badge color={getPriorityColor(story.priority)} variant="light">
              {story.priority.toUpperCase()}
            </Badge>
            <Badge
              color={getEffortColor(story.estimatedEffort)}
              variant="light"
            >
              {story.estimatedEffort.toUpperCase()}
            </Badge>
            <Badge color={getStatusColor(story.status)} variant="light">
              {story.status.toUpperCase()}
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
                <Tooltip label="Edit story">
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

      {/* Story Format */}
      <Paper p="md" bg="gray.0" radius="md" mb="md">
        {isEditing ? (
          <Stack gap="sm">
            <Box>
              <Text size="sm" fw={500} mb={4}>
                As a...
              </Text>
              <TextInput
                value={editedStory.asA}
                onChange={(e) =>
                  setEditedStory({ ...editedStory, asA: e.target.value })
                }
                size="sm"
              />
            </Box>
            <Box>
              <Text size="sm" fw={500} mb={4}>
                I want...
              </Text>
              <Textarea
                value={editedStory.iWant}
                onChange={(e) =>
                  setEditedStory({ ...editedStory, iWant: e.target.value })
                }
                size="sm"
                rows={2}
              />
            </Box>
            <Box>
              <Text size="sm" fw={500} mb={4}>
                So that...
              </Text>
              <Textarea
                value={editedStory.soThat}
                onChange={(e) =>
                  setEditedStory({ ...editedStory, soThat: e.target.value })
                }
                size="sm"
                rows={2}
              />
            </Box>
          </Stack>
        ) : (
          <Stack gap="xs">
            <Text size="sm">
              <Text component="span" fw={600} c="blue.7">
                As a
              </Text>{" "}
              {story.asA}
            </Text>
            <Text size="sm">
              <Text component="span" fw={600} c="green.7">
                I want
              </Text>{" "}
              {story.iWant}
            </Text>
            <Text size="sm">
              <Text component="span" fw={600} c="violet.7">
                So that
              </Text>{" "}
              {story.soThat}
            </Text>
          </Stack>
        )}
      </Paper>

      {story.description && (
        <Box mb="md">
          <Text size="sm" fw={500} mb={4}>
            Description
          </Text>
          <Text size="sm" c="dimmed">
            {story.description}
          </Text>
        </Box>
      )}

      {/* Acceptance Criteria */}
      {isExpanded && (
        <Stack gap="md">
          <Box>
            <Text size="sm" fw={500} mb="sm">
              Acceptance Criteria
            </Text>
            <Stack gap="xs">
              {story.acceptanceCriteria.map((criteria) => (
                <Paper
                  key={criteria.id}
                  p="sm"
                  bg="gray.0"
                  radius="sm"
                  withBorder
                  style={{
                    borderLeft: `3px solid var(--mantine-color-blue-4)`,
                  }}
                >
                  <Group justify="space-between" align="flex-start" mb="xs">
                    <Group gap="xs">
                      <Badge
                        color={
                          criteria.priority === "must"
                            ? "red"
                            : criteria.priority === "should"
                              ? "yellow"
                              : "green"
                        }
                        size="xs"
                      >
                        {criteria.priority.toUpperCase()}
                      </Badge>
                      {criteria.testable && (
                        <Badge color="blue" size="xs">
                          TESTABLE
                        </Badge>
                      )}
                    </Group>
                  </Group>
                  <Text size="sm">{criteria.description}</Text>
                </Paper>
              ))}
            </Stack>
          </Box>

          {/* Tags */}
          {story.tags.length > 0 && (
            <Box>
              <Text size="sm" fw={500} mb="sm">
                Tags
              </Text>
              <Group gap="xs">
                {story.tags.map((tag, index) => (
                  <Badge key={index} color="gray" variant="light" size="sm">
                    {tag}
                  </Badge>
                ))}
              </Group>
            </Box>
          )}

          {/* Related Information */}
          <Paper p="sm" bg="gray.0" radius="sm">
            <Group justify="space-between" align="center">
              <Text size="xs" c="dimmed">
                <Text component="span" fw={500}>
                  Related Personas:
                </Text>{" "}
                {story.relatedPersonas.length}
              </Text>
              <Text size="xs" c="dimmed">
                <Text component="span" fw={500}>
                  Related Goals:
                </Text>{" "}
                {story.relatedGoals.length}
              </Text>
              <Text size="xs" c="dimmed">
                <Text component="span" fw={500}>
                  Constraints:
                </Text>{" "}
                {story.constraints.length}
              </Text>
              <Text size="xs" c="dimmed">
                <Text component="span" fw={500}>
                  Status:
                </Text>{" "}
                {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
              </Text>
            </Group>
          </Paper>
        </Stack>
      )}
    </Card>
  );
}
