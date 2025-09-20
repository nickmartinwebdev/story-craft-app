import { useState } from "react";
import {
  Card,
  Group,
  Text,
  Stack,
  Button,
  Box,
  Paper,
  Tabs,
  Center,
  SimpleGrid,
} from "@mantine/core";
import {
  IconRefresh,
  IconLayoutGrid,
  IconList,
  IconFileText,
  IconBooks,
} from "@tabler/icons-react";
import { useEnhancedProposals } from "../../contexts/EnhancedProposalsContext";
import { StoryCard } from "./StoryCard";
import { EpicCard } from "./EpicCard";

interface ContentGenerationPanelProps {
  className?: string;
}

export function ContentGenerationPanel({
  className = "",
}: ContentGenerationPanelProps) {
  const {
    currentProposal,
    generatedContent,
    currentPhase,
    isGenerating,
    generateUserStories,
    generateEpics,
    regenerateContent,
    updateUserStory,
    updateEpic,
  } = useEnhancedProposals();

  const [activeTab, setActiveTab] = useState<string>("stories");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  if (!currentProposal) {
    return (
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        className={className}
      >
        <Center>
          <Text c="dimmed">No proposal active</Text>
        </Center>
      </Card>
    );
  }

  const handleGenerateStories = async () => {
    await generateUserStories();
  };

  const handleGenerateEpics = async () => {
    await generateEpics();
  };

  const handleRegenerateAll = async () => {
    await regenerateContent();
  };

  const renderStoryFormationContent = () => {
    const hasStories = generatedContent.userStories.length > 0;

    return (
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Box>
            <Text size="lg" fw={600}>
              User Stories
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Generated from personas, goals, and constraints
            </Text>
          </Box>
          <Group gap="xs">
            {hasStories && (
              <>
                <Button
                  leftSection={<IconRefresh size={14} />}
                  variant="default"
                  size="sm"
                  onClick={handleRegenerateAll}
                  loading={isGenerating}
                >
                  {isGenerating ? "Regenerating..." : "Regenerate"}
                </Button>
                <Button.Group>
                  <Button
                    variant={viewMode === "grid" ? "filled" : "default"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    leftSection={<IconLayoutGrid size={14} />}
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "filled" : "default"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    leftSection={<IconList size={14} />}
                  >
                    List
                  </Button>
                </Button.Group>
              </>
            )}
          </Group>
        </Group>

        {/* Content */}
        {!hasStories ? (
          <Paper
            p="xl"
            radius="md"
            withBorder
            style={{ border: "2px dashed var(--mantine-color-gray-4)" }}
          >
            <Center>
              <Stack align="center" gap="md">
                <Text size="48px">📝</Text>
                <Text size="lg" fw={500}>
                  Ready to Generate User Stories
                </Text>
                <Text c="dimmed" ta="center" maw={400}>
                  I'll create structured user stories based on all the
                  information we've gathered about personas, goals, and
                  constraints.
                </Text>
                <Button
                  leftSection={<IconFileText size="1rem" />}
                  size="md"
                  onClick={handleGenerateStories}
                  loading={isGenerating}
                >
                  {isGenerating
                    ? "Generating Stories..."
                    : "Generate User Stories"}
                </Button>
              </Stack>
            </Center>
          </Paper>
        ) : (
          <Stack gap="md">
            {/* Stats */}
            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
              <Paper p="md" radius="md" bg="blue.0" withBorder>
                <Text size="xl" fw={700} c="blue.7">
                  {generatedContent.userStories.length}
                </Text>
                <Text size="sm" c="blue.6">
                  Total Stories
                </Text>
              </Paper>
              <Paper p="md" radius="md" bg="red.0" withBorder>
                <Text size="xl" fw={700} c="red.7">
                  {
                    generatedContent.userStories.filter(
                      (s) => s.priority === "high",
                    ).length
                  }
                </Text>
                <Text size="sm" c="red.6">
                  High Priority
                </Text>
              </Paper>
              <Paper p="md" radius="md" bg="green.0" withBorder>
                <Text size="xl" fw={700} c="green.7">
                  {
                    generatedContent.userStories.filter(
                      (s) => s.status === "approved",
                    ).length
                  }
                </Text>
                <Text size="sm" c="green.6">
                  Approved
                </Text>
              </Paper>
              <Paper p="md" radius="md" bg="violet.0" withBorder>
                <Text size="xl" fw={700} c="violet.7">
                  {generatedContent.userStories.reduce(
                    (acc, s) => acc + s.acceptanceCriteria.length,
                    0,
                  )}
                </Text>
                <Text size="sm" c="violet.6">
                  Acceptance Criteria
                </Text>
              </Paper>
            </SimpleGrid>

            {/* Stories Grid/List */}
            {viewMode === "grid" ? (
              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                {generatedContent.userStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onUpdate={(updates) => updateUserStory(story.id, updates)}
                    isEditable={true}
                    compact={true}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <Stack gap="md">
                {generatedContent.userStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onUpdate={(updates) => updateUserStory(story.id, updates)}
                    isEditable={true}
                    compact={false}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    );
  };

  const renderEpicCreationContent = () => {
    const hasEpics = generatedContent.epics.length > 0;
    const hasStories = generatedContent.userStories.length > 0;

    return (
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Box>
            <Text size="lg" fw={600}>
              Epics
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              Organized collections of related user stories
            </Text>
          </Box>
          <Group gap="xs">
            {hasEpics && (
              <>
                <Button
                  leftSection={<IconRefresh size={14} />}
                  variant="default"
                  size="sm"
                  onClick={handleRegenerateAll}
                  loading={isGenerating}
                >
                  {isGenerating ? "Regenerating..." : "Regenerate"}
                </Button>
                <Button.Group>
                  <Button
                    variant={viewMode === "grid" ? "filled" : "default"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    leftSection={<IconLayoutGrid size={14} />}
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "filled" : "default"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    leftSection={<IconList size={14} />}
                  >
                    List
                  </Button>
                </Button.Group>
              </>
            )}
          </Group>
        </Group>

        {/* Content */}
        {!hasStories ? (
          <Paper
            p="xl"
            radius="md"
            withBorder
            style={{ border: "2px dashed var(--mantine-color-gray-4)" }}
          >
            <Center>
              <Stack align="center" gap="md">
                <Text size="48px">📝</Text>
                <Text size="lg" fw={500}>
                  Generate User Stories First
                </Text>
                <Text c="dimmed" ta="center" maw={400}>
                  Epics are created from user stories. Please generate user
                  stories in the Story Formation phase first.
                </Text>
              </Stack>
            </Center>
          </Paper>
        ) : !hasEpics ? (
          <Paper
            p="xl"
            radius="md"
            withBorder
            style={{ border: "2px dashed var(--mantine-color-gray-4)" }}
          >
            <Center>
              <Stack align="center" gap="md">
                <Text size="48px">📚</Text>
                <Text size="lg" fw={500}>
                  Ready to Create Epics
                </Text>
                <Text c="dimmed" ta="center" maw={400}>
                  I'll organize your {generatedContent.userStories.length} user
                  stories into meaningful epics based on themes and business
                  capabilities.
                </Text>
                <Button
                  leftSection={<IconBooks size="1rem" />}
                  size="md"
                  onClick={handleGenerateEpics}
                  loading={isGenerating}
                >
                  {isGenerating ? "Creating Epics..." : "Create Epics"}
                </Button>
              </Stack>
            </Center>
          </Paper>
        ) : (
          <Stack gap="md">
            {/* Stats */}
            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
              <Paper p="md" radius="md" bg="blue.0" withBorder>
                <Text size="xl" fw={700} c="blue.7">
                  {generatedContent.epics.length}
                </Text>
                <Text size="sm" c="blue.6">
                  Total Epics
                </Text>
              </Paper>
              <Paper p="md" radius="md" bg="red.0" withBorder>
                <Text size="xl" fw={700} c="red.7">
                  {
                    generatedContent.epics.filter((e) => e.priority === "high")
                      .length
                  }
                </Text>
                <Text size="sm" c="red.6">
                  High Priority
                </Text>
              </Paper>
              <Paper p="md" radius="md" bg="green.0" withBorder>
                <Text size="xl" fw={700} c="green.7">
                  {
                    generatedContent.epics.filter(
                      (e) => e.status === "approved",
                    ).length
                  }
                </Text>
                <Text size="sm" c="green.6">
                  Approved
                </Text>
              </Paper>
              <Paper p="md" radius="md" bg="violet.0" withBorder>
                <Text size="xl" fw={700} c="violet.7">
                  {generatedContent.epics.reduce(
                    (acc, e) => acc + e.userStories.length,
                    0,
                  )}
                </Text>
                <Text size="sm" c="violet.6">
                  Stories Organized
                </Text>
              </Paper>
            </SimpleGrid>

            {/* Epics Grid/List */}
            {viewMode === "grid" ? (
              <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
                {generatedContent.epics.map((epic) => (
                  <EpicCard
                    key={epic.id}
                    epic={epic}
                    userStories={generatedContent.userStories}
                    onUpdate={(updates) => updateEpic(epic.id, updates)}
                    isEditable={true}
                    compact={true}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <Stack gap="lg">
                {generatedContent.epics.map((epic) => (
                  <EpicCard
                    key={epic.id}
                    epic={epic}
                    userStories={generatedContent.userStories}
                    onUpdate={(updates) => updateEpic(epic.id, updates)}
                    isEditable={true}
                    compact={false}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    );
  };

  const renderTabbedView = () => {
    return (
      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value || "stories")}
      >
        <Tabs.List>
          <Tabs.Tab value="stories" leftSection={<IconFileText size="1rem" />}>
            User Stories ({generatedContent.userStories.length})
          </Tabs.Tab>
          <Tabs.Tab value="epics" leftSection={<IconBooks size="1rem" />}>
            Epics ({generatedContent.epics.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="stories" pt="md">
          {renderStoryFormationContent()}
        </Tabs.Panel>

        <Tabs.Panel value="epics" pt="md">
          {renderEpicCreationContent()}
        </Tabs.Panel>
      </Tabs>
    );
  };

  // Show different content based on current phase
  if (currentPhase === "story-formation") {
    return (
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        className={className}
      >
        {renderStoryFormationContent()}
      </Card>
    );
  }

  if (currentPhase === "epic-creation") {
    return (
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        className={className}
      >
        {renderEpicCreationContent()}
      </Card>
    );
  }

  if (currentPhase === "refinement") {
    return (
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        className={className}
      >
        {renderTabbedView()}
      </Card>
    );
  }

  // For information-gathering phase or other phases
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      bg="gray.0"
      className={className}
    >
      <Center py="xl">
        <Stack align="center" gap="md">
          <Text size="48px">🔍</Text>
          <Text size="lg" fw={500}>
            Continue Information Gathering
          </Text>
          <Text c="dimmed" ta="center" maw={400}>
            Complete the information gathering phase to unlock story and epic
            generation. I need to understand your personas, goals, and
            constraints first.
          </Text>
        </Stack>
      </Center>
    </Card>
  );
}
