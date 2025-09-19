import React, { useState } from "react";
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  MultiSelect,
  Select,
  Text,
  Divider,
} from "@mantine/core";
import { useProposals } from "../contexts/ProposalsContext";
import { SavedProposal } from "../types/proposals";
import { notifications } from "@mantine/notifications";

interface ProposalSaveDialogProps {
  opened: boolean;
  onClose: () => void;
  proposalToEdit?: SavedProposal | null;
}

export function ProposalSaveDialog({
  opened,
  onClose,
  proposalToEdit,
}: ProposalSaveDialogProps) {
  const { saveCurrentProposal, currentProposal, getAllTags, saveProposal } =
    useProposals();

  const [title, setTitle] = useState(proposalToEdit?.title || "");
  const [description, setDescription] = useState(
    proposalToEdit?.description || "",
  );
  const [tags, setTags] = useState<string[]>(proposalToEdit?.tags || []);
  const [status, setStatus] = useState<SavedProposal["status"]>(
    proposalToEdit?.status || "draft",
  );
  const [isLoading, setIsLoading] = useState(false);

  const allTags = getAllTags();
  const isEditing = !!proposalToEdit;

  const handleSave = async () => {
    if (!title.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Please enter a title for your proposal",
        color: "red",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && proposalToEdit) {
        // Update existing proposal
        const updatedProposal: SavedProposal = {
          ...proposalToEdit,
          title: title.trim(),
          description: description.trim(),
          tags,
          status,
          updatedAt: new Date(),
        };
        await saveProposal(updatedProposal);
        notifications.show({
          title: "Success",
          message: "Proposal updated successfully",
          color: "green",
        });
      } else {
        // Save current proposal
        if (!currentProposal) {
          notifications.show({
            title: "Error",
            message: "No active proposal to save",
            color: "red",
          });
          return;
        }

        const savedProposal = await saveCurrentProposal(title.trim());

        // Update additional fields if provided
        if (description.trim() || tags.length > 0 || status !== "draft") {
          const updatedProposal: SavedProposal = {
            ...savedProposal,
            description: description.trim(),
            tags,
            status,
            updatedAt: new Date(),
          };
          await saveProposal(updatedProposal);
        }

        notifications.show({
          title: "Success",
          message: "Proposal saved successfully",
          color: "green",
        });
      }

      onClose();
      resetForm();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to save proposal",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTags([]);
    setStatus("draft");
  };

  const handleClose = () => {
    onClose();
    if (!isEditing) {
      resetForm();
    }
  };

  // Auto-populate title when modal opens for new proposals
  React.useEffect(() => {
    if (opened && !isEditing && currentProposal && !title) {
      const autoTitle = currentProposal.messages
        .filter((m) => m.isUser)
        .map((m) => m.content)
        .join(" ")
        .substring(0, 100);

      if (autoTitle.trim()) {
        setTitle(autoTitle.trim() + (autoTitle.length >= 100 ? "..." : ""));
      }
    }
  }, [opened, isEditing, currentProposal, title]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isEditing ? "Edit Proposal" : "Save Proposal"}
      size="md"
      centered
    >
      <Stack gap="md">
        <TextInput
          label="Title"
          placeholder="Enter a descriptive title for your proposal"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
          error={!title.trim() ? "Title is required" : undefined}
        />

        <Textarea
          label="Description"
          placeholder="Add a brief description of your proposal (optional)"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={3}
        />

        <MultiSelect
          label="Tags"
          placeholder="Add tags to organize your proposals"
          data={allTags}
          value={tags}
          onChange={setTags}
          searchable
        />

        <Select
          label="Status"
          data={[
            { value: "draft", label: "Draft" },
            { value: "in-progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
            { value: "archived", label: "Archived" },
          ]}
          value={status}
          onChange={(value) => setStatus(value as SavedProposal["status"])}
        />

        {!isEditing && (
          <>
            <Divider />
            <Text size="sm" c="dimmed">
              This will save your current conversation with{" "}
              {currentProposal?.messages.length || 0} messages.
            </Text>
          </>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={isLoading}>
            {isEditing ? "Update" : "Save"} Proposal
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
