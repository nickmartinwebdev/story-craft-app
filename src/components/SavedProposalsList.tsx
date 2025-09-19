import { useState } from "react";
import {
  Stack,
  Group,
  TextInput,
  Select,
  Button,
  Card,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Title,
  Box,
  MultiSelect,
  Paper,
  Modal,
  Container,
} from "@mantine/core";
import {
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconDots,
  IconTrash,
  IconEye,
  IconPlus,
  IconCalendar,
  IconTag,
} from "@tabler/icons-react";
import { useProposals } from "../contexts/ProposalsContext";
import {
  SavedProposal,
  ProposalFilters,
  ProposalSortOptions,
} from "../types/proposals";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

interface SavedProposalsListProps {
  onSelectProposal: (proposal: SavedProposal) => void;
  onCreateNew: () => void;
}

export function SavedProposalsList({
  onSelectProposal,
  onCreateNew,
}: SavedProposalsListProps) {
  const {
    filters,
    sortOptions,
    setFilters,
    setSortOptions,
    getFilteredProposals,
    getAllTags,
    deleteProposal,
    isLoading,
  } = useProposals();

  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [proposalToDelete, setProposalToDelete] =
    useState<SavedProposal | null>(null);

  const proposals = getFilteredProposals();
  const allTags = getAllTags();

  const handleFilterChange = (key: keyof ProposalFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleSortChange = (sortBy: ProposalSortOptions["sortBy"]) => {
    const newOrder =
      sortOptions.sortBy === sortBy && sortOptions.order === "asc"
        ? "desc"
        : "asc";
    setSortOptions({ sortBy, order: newOrder });
  };

  const handleDeleteClick = (proposal: SavedProposal) => {
    setProposalToDelete(proposal);
    openDeleteModal();
  };

  const confirmDelete = async () => {
    if (!proposalToDelete) return;

    try {
      await deleteProposal(proposalToDelete.id);
      notifications.show({
        title: "Success",
        message: "Proposal deleted successfully",
        color: "green",
      });
      closeDeleteModal();
      setProposalToDelete(null);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to delete proposal",
        color: "red",
      });
    }
  };

  const formatDate = (date: Date | string) => {
    // Ensure we have a valid Date object
    let dateObj: Date;
    if (typeof date === "string") {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      dateObj = new Date();
    }

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(dateObj);
  };

  const getStatusColor = (status: SavedProposal["status"]) => {
    switch (status) {
      case "draft":
        return "gray";
      case "in-progress":
        return "blue";
      case "completed":
        return "green";
      case "archived":
        return "yellow";
      default:
        return "gray";
    }
  };

  return (
    <Container size="lg" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Title order={2}>Saved Proposals</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={onCreateNew}
            variant="filled"
          >
            New Proposal
          </Button>
        </Group>

        {/* Filters and Search */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group grow>
              <TextInput
                placeholder="Search proposals..."
                leftSection={<IconSearch size={16} />}
                value={filters.searchQuery || ""}
                onChange={(e) =>
                  handleFilterChange("searchQuery", e.currentTarget.value)
                }
              />
              <Select
                placeholder="Filter by status"
                data={[
                  { value: "all", label: "All Statuses" },
                  { value: "draft", label: "Draft" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "completed", label: "Completed" },
                  { value: "archived", label: "Archived" },
                ]}
                value={filters.status || "all"}
                onChange={(value) => handleFilterChange("status", value)}
              />
            </Group>

            {allTags.length > 0 && (
              <MultiSelect
                placeholder="Filter by tags"
                data={allTags}
                value={filters.tags || []}
                onChange={(value) => handleFilterChange("tags", value)}
                searchable
                clearable
              />
            )}

            {/* Sort Options */}
            <Group>
              <Text size="sm" c="dimmed">
                Sort by:
              </Text>
              <Group gap="xs">
                {[
                  { key: "title" as const, label: "Title" },
                  { key: "createdAt" as const, label: "Created" },
                  { key: "updatedAt" as const, label: "Updated" },
                  { key: "status" as const, label: "Status" },
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    variant={sortOptions.sortBy === key ? "filled" : "subtle"}
                    size="xs"
                    rightSection={
                      sortOptions.sortBy === key ? (
                        sortOptions.order === "asc" ? (
                          <IconSortAscending size={12} />
                        ) : (
                          <IconSortDescending size={12} />
                        )
                      ) : null
                    }
                    onClick={() => handleSortChange(key)}
                  >
                    {label}
                  </Button>
                ))}
              </Group>
            </Group>
          </Stack>
        </Paper>

        {/* Proposals List */}
        {isLoading ? (
          <Text ta="center" c="dimmed">
            Loading proposals...
          </Text>
        ) : proposals.length === 0 ? (
          <Paper p="xl" ta="center">
            <Text c="dimmed" size="lg">
              No proposals found
            </Text>
            <Text c="dimmed" size="sm" mt="xs">
              {Object.keys(filters).some(
                (key) => filters[key as keyof ProposalFilters],
              )
                ? "Try adjusting your filters or search terms"
                : "Create your first proposal to get started"}
            </Text>
          </Paper>
        ) : (
          <Stack gap="md">
            {proposals.map((proposal) => (
              <Card
                key={proposal.id}
                withBorder
                padding="lg"
                radius="md"
                onClick={() => onSelectProposal(proposal)}
                style={{ cursor: "pointer" }}
                styles={{
                  root: {
                    "&:hover": {
                      backgroundColor: "var(--mantine-color-gray-0)",
                      borderColor: "var(--mantine-color-blue-3)",
                      transform: "translateY(-2px)",
                      boxShadow: "var(--mantine-shadow-lg)",
                    },
                    transition: "all 0.2s ease",
                  },
                }}
              >
                <Stack gap="sm">
                  {/* Header */}
                  <Group justify="space-between" align="flex-start">
                    <Box style={{ flex: 1 }}>
                      <Group gap="sm" mb="xs">
                        <Text fw={600} size="lg" lineClamp={1}>
                          {proposal.title}
                        </Text>
                        <Badge
                          color={getStatusColor(proposal.status)}
                          variant="light"
                          size="sm"
                        >
                          {proposal.status}
                        </Badge>
                      </Group>

                      {proposal.description && (
                        <Text c="dimmed" size="sm" lineClamp={2} mb="xs">
                          {proposal.description}
                        </Text>
                      )}
                    </Box>

                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon
                          variant="subtle"
                          c="gray"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEye size={14} />}
                          onClick={() => onSelectProposal(proposal)}
                        >
                          View/Edit
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={() => handleDeleteClick(proposal)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>

                  {/* Tags */}
                  {proposal.tags.length > 0 && (
                    <Group gap="xs">
                      <IconTag size={14} color="var(--mantine-color-dimmed)" />
                      {proposal.tags.map((tag) => (
                        <Badge key={tag} size="xs" variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </Group>
                  )}

                  {/* Footer */}
                  <Group justify="space-between" mt="sm">
                    <Group gap="md">
                      <Group gap="xs">
                        <IconCalendar
                          size={14}
                          color="var(--mantine-color-dimmed)"
                        />
                        <Text size="xs" c="dimmed">
                          Created: {formatDate(proposal.createdAt)}
                        </Text>
                      </Group>
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">
                          Updated: {formatDate(proposal.updatedAt)}
                        </Text>
                      </Group>
                    </Group>

                    <Text size="xs" c="dimmed">
                      {proposal.messages.length} messages
                    </Text>
                  </Group>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete Proposal"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete "{proposalToDelete?.title}"? This
            action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
