import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/react-query";
import { SavedProposal, ProposalMessage } from "../../types/proposals";

// Create a query client for the proposals collection
const queryClient = new QueryClient();

// Storage key for localStorage
const STORAGE_KEY = "storycraft-proposals";

// Helper functions for localStorage operations
// Utility function to ensure all dates in proposals are proper Date objects
const ensureProposalDates = (proposals: any[]): SavedProposal[] => {
  return proposals.map((proposal) => ({
    ...proposal,
    createdAt:
      proposal.createdAt instanceof Date
        ? proposal.createdAt
        : new Date(proposal.createdAt || Date.now()),
    updatedAt:
      proposal.updatedAt instanceof Date
        ? proposal.updatedAt
        : new Date(proposal.updatedAt || Date.now()),
    messages: proposal.messages.map((message: any) => ({
      ...message,
      timestamp:
        message.timestamp instanceof Date
          ? message.timestamp
          : new Date(message.timestamp || Date.now()),
    })),
  }));
};

const loadProposalsFromStorage = (): SavedProposal[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored, (_, value) => {
      if (value && typeof value === "object" && value.__type === "Date") {
        return new Date(value.value);
      }
      return value;
    });

    // Ensure all dates are proper Date objects
    return ensureProposalDates(parsed);
  } catch (error) {
    console.error("Error reading proposals from storage:", error);
    return [];
  }
};

const saveProposalsToStorage = (proposals: SavedProposal[]): void => {
  try {
    const serialized = JSON.stringify(proposals, (_, value) => {
      if (value instanceof Date) {
        return { __type: "Date", value: value.toISOString() };
      }
      return value;
    });
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error("Error saving proposals to storage:", error);
    throw error;
  }
};

// Create the proposals collection using query collection options
export const proposalCollection = createCollection(
  queryCollectionOptions<SavedProposal>({
    queryKey: ["proposals"],
    queryFn: async (): Promise<SavedProposal[]> => {
      // Load data from localStorage
      return loadProposalsFromStorage();
    },
    queryClient,
    getKey: (item) => item.id,

    // Handle insert operations
    onInsert: async ({ transaction }) => {
      try {
        const currentProposals = loadProposalsFromStorage();
        const newProposals = transaction.mutations.map((m) => m.modified);

        const updatedProposals = [...currentProposals, ...newProposals];
        saveProposalsToStorage(updatedProposals);

        console.log("Inserted proposals:", newProposals.length);
        return { refetch: false }; // We already have the data, no need to refetch
      } catch (error) {
        console.error("Error inserting proposals:", error);
        throw error;
      }
    },

    // Handle update operations
    onUpdate: async ({ transaction }) => {
      try {
        const currentProposals = loadProposalsFromStorage();

        // Apply all updates
        const updatedProposals = currentProposals.map((proposal) => {
          const mutation = transaction.mutations.find(
            (m) => m.key === proposal.id,
          );
          if (mutation) {
            return { ...proposal, ...mutation.modified, updatedAt: new Date() };
          }
          return proposal;
        });

        saveProposalsToStorage(updatedProposals);

        console.log("Updated proposals:", transaction.mutations.length);
        return { refetch: false };
      } catch (error) {
        console.error("Error updating proposals:", error);
        throw error;
      }
    },

    // Handle delete operations
    onDelete: async ({ transaction }) => {
      try {
        const currentProposals = loadProposalsFromStorage();
        const keysToDelete = transaction.mutations.map((m) => m.key);

        const filteredProposals = currentProposals.filter(
          (proposal) => !keysToDelete.includes(proposal.id),
        );

        saveProposalsToStorage(filteredProposals);

        console.log("Deleted proposals:", keysToDelete.length);
        return { refetch: false };
      } catch (error) {
        console.error("Error deleting proposals:", error);
        throw error;
      }
    },
  }),
);

// Helper functions for proposal operations
export class ProposalCollectionService {
  static generateId(): string {
    return `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static extractTitleFromMessages(messages: ProposalMessage[]): string {
    const userMessages = messages.filter((m) => m.isUser);

    if (userMessages.length === 0) {
      return "New Proposal";
    }

    const firstUserMessage = userMessages[0].content;
    const sentences = firstUserMessage.split(/[.!?]+/);
    const title = sentences[0]?.trim() || firstUserMessage;

    return title.length > 50 ? title.substring(0, 50) + "..." : title;
  }

  static createProposalFromMessages(
    messages: ProposalMessage[],
    title?: string,
  ): SavedProposal {
    const id = this.generateId();
    const now = new Date();

    return {
      id,
      title: title || this.extractTitleFromMessages(messages),
      description:
        messages.length > 0
          ? messages.find((m) => m.isUser)?.content.substring(0, 200) + "..." ||
            ""
          : "",
      messages,
      createdAt: now,
      updatedAt: now,
      tags: [],
      status: "draft",
    };
  }

  // Check if a proposal exists in the collection
  static proposalExistsInCollection(id: string): boolean {
    try {
      // First check the query cache
      const queryCache = queryClient.getQueryData<SavedProposal[]>([
        "proposals",
      ]);

      if (queryCache && Array.isArray(queryCache)) {
        const existsInCache = queryCache.some((proposal) => proposal.id === id);
        if (existsInCache) {
          return true;
        }
      }

      // Fallback: check localStorage directly if query cache is not available
      const proposals = loadProposalsFromStorage();
      return proposals.some((proposal) => proposal.id === id);
    } catch (error) {
      console.error("Error checking proposal existence:", error);
      return false;
    }
  }

  // Insert a new proposal
  static async insertProposal(proposal: SavedProposal): Promise<void> {
    proposalCollection.insert(proposal);
  }

  // Update an existing proposal
  static async updateProposal(
    id: string,
    updates: Partial<SavedProposal>,
  ): Promise<void> {
    proposalCollection.update(id, (draft) => {
      Object.assign(draft, { ...updates, updatedAt: new Date() });
    });
  }

  // Save or update a proposal (handles existence check internally)
  static async saveProposal(proposal: SavedProposal): Promise<void> {
    try {
      // Basic validation
      if (!proposal.id) {
        throw new Error("Proposal ID is required");
      }
      if (!proposal.title) {
        throw new Error("Proposal title is required");
      }
      if (!Array.isArray(proposal.messages)) {
        throw new Error("Proposal messages must be an array");
      }

      const exists = this.proposalExistsInCollection(proposal.id);

      if (exists) {
        await this.updateProposal(proposal.id, {
          ...proposal,
          updatedAt: new Date(),
        });
      } else {
        await this.insertProposal(proposal);
      }
    } catch (error) {
      // If the update fails because the proposal doesn't exist in the collection,
      // fall back to inserting it
      if (
        error instanceof Error &&
        error.message.includes("was not found in the collection")
      ) {
        try {
          await this.insertProposal(proposal);
        } catch (insertError) {
          throw insertError;
        }
      } else {
        throw error;
      }
    }
  }

  // Delete a proposal
  static async deleteProposal(id: string): Promise<void> {
    proposalCollection.delete(id);
  }

  // Update proposal messages
  static async updateProposalMessages(
    id: string,
    messages: ProposalMessage[],
  ): Promise<void> {
    proposalCollection.update(id, (draft) => {
      draft.messages = messages;
      draft.updatedAt = new Date();
    });
  }

  // Save proposal from current messages
  static async saveCurrentProposal(
    messages: ProposalMessage[],
    title?: string,
  ): Promise<SavedProposal> {
    const proposal = this.createProposalFromMessages(messages, title);
    await this.insertProposal(proposal);
    return proposal;
  }
}
