import { useLiveQuery } from "@tanstack/react-db";
import {
  proposalCollection,
  ProposalCollectionService,
} from "../db/collections/proposalCollection";
import {
  SavedProposal,
  ProposalMessage,
  ProposalFilters,
  ProposalSortOptions,
} from "../types/proposals";
import { EnhancedProposal } from "../types/enhanced-proposals";

/**
 * TanStack DB-based storage service for proposals
 * This service provides a clean interface for proposal operations
 * using TanStack DB collections for better abstraction and future extensibility
 */
export class ProposalDbService {
  private static instance: ProposalDbService;

  static getInstance(): ProposalDbService {
    if (!ProposalDbService.instance) {
      ProposalDbService.instance = new ProposalDbService();
    }
    return ProposalDbService.instance;
  }

  // Get all proposals from the collection
  getAllProposals(): SavedProposal[] {
    try {
      // Get proposals from localStorage directly for synchronous access
      const stored = localStorage.getItem("storycraft-proposals");
      if (!stored) return [];

      const parsed = JSON.parse(stored, (_, value) => {
        if (value && typeof value === "object" && value.__type === "Date") {
          return new Date(value.value);
        }
        return value;
      });

      // Ensure all dates are proper Date objects (safety check for existing data)
      return parsed.map((proposal: any) => ({
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
    } catch (error) {
      console.error("Error reading proposals:", error);
      return [];
    }
  }

  // Save a proposal using the collection
  async saveProposal(proposal: SavedProposal): Promise<void> {
    try {
      // Use the collection service's saveProposal method which handles existence check
      await ProposalCollectionService.saveProposal(proposal);
    } catch (error) {
      console.error("Error saving proposal:", error);
      throw new Error("Failed to save proposal");
    }
  }

  // Get a specific proposal by ID
  getProposalById(id: string): SavedProposal | null {
    const proposals = this.getAllProposals();
    return proposals.find((p) => p.id === id) || null;
  }

  // Delete a proposal using the collection
  async deleteProposal(id: string): Promise<boolean> {
    try {
      const existing = this.getProposalById(id);
      if (!existing) {
        return false;
      }

      await ProposalCollectionService.deleteProposal(id);
      return true;
    } catch (error) {
      console.error("Error deleting proposal:", error);
      throw new Error("Failed to delete proposal");
    }
  }

  // Update proposal messages
  async updateProposalMessages(
    id: string,
    messages: ProposalMessage[],
  ): Promise<boolean> {
    try {
      const existing = this.getProposalById(id);
      if (!existing) {
        return false;
      }

      await ProposalCollectionService.updateProposalMessages(id, messages);
      return true;
    } catch (error) {
      console.error("Error updating proposal messages:", error);
      throw new Error("Failed to update proposal messages");
    }
  }

  // Filter and sort proposals
  filterAndSortProposals(
    filters: ProposalFilters = {},
    sortOptions: ProposalSortOptions = { sortBy: "updatedAt", order: "desc" },
  ): SavedProposal[] {
    let proposals = this.getAllProposals();

    // Apply filters
    if (filters.status && filters.status !== "all") {
      proposals = proposals.filter((p) => p.status === filters.status);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      proposals = proposals.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      proposals = proposals.filter((p) =>
        filters.tags!.some((tag) => p.tags.includes(tag)),
      );
    }

    if (filters.dateRange) {
      proposals = proposals.filter((p) => {
        if (
          filters.dateRange!.start &&
          p.createdAt < filters.dateRange!.start
        ) {
          return false;
        }
        if (filters.dateRange!.end && p.createdAt > filters.dateRange!.end) {
          return false;
        }
        return true;
      });
    }

    // Apply sorting
    proposals.sort((a, b) => {
      let comparison = 0;

      switch (sortOptions.sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "createdAt":
          // Defensive check to ensure dates are Date objects
          const aCreatedAt =
            a.createdAt instanceof Date
              ? a.createdAt
              : new Date(a.createdAt || 0);
          const bCreatedAt =
            b.createdAt instanceof Date
              ? b.createdAt
              : new Date(b.createdAt || 0);
          comparison = aCreatedAt.getTime() - bCreatedAt.getTime();
          break;
        case "updatedAt":
          // Defensive check to ensure dates are Date objects
          const aUpdatedAt =
            a.updatedAt instanceof Date
              ? a.updatedAt
              : new Date(a.updatedAt || 0);
          const bUpdatedAt =
            b.updatedAt instanceof Date
              ? b.updatedAt
              : new Date(b.updatedAt || 0);
          comparison = aUpdatedAt.getTime() - bUpdatedAt.getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }

      return sortOptions.order === "desc" ? -comparison : comparison;
    });

    return proposals;
  }

  // Get all unique tags from proposals
  getAllTags(): string[] {
    const proposals = this.getAllProposals();
    const tagSet = new Set<string>();

    proposals.forEach((proposal) => {
      proposal.tags.forEach((tag) => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
  }

  // Generate a unique proposal ID
  generateProposalId(): string {
    return ProposalCollectionService.generateId();
  }

  // Extract title from messages
  extractTitleFromMessages(messages: ProposalMessage[]): string {
    return ProposalCollectionService.extractTitleFromMessages(messages);
  }

  // Create a proposal from messages
  createProposalFromMessages(
    messages: ProposalMessage[],
    title?: string,
  ): SavedProposal {
    return ProposalCollectionService.createProposalFromMessages(
      messages,
      title,
    );
  }

  // Save current proposal from messages
  async saveCurrentProposal(
    messages: ProposalMessage[],
    title?: string,
  ): Promise<SavedProposal> {
    return await ProposalCollectionService.saveCurrentProposal(messages, title);
  }

  // Enhanced Proposal specific methods

  // Save enhanced proposal to localStorage
  async saveEnhancedProposal(proposal: EnhancedProposal): Promise<void> {
    try {
      const stored = localStorage.getItem("storycraft-enhanced-proposals");
      const proposals: EnhancedProposal[] = stored ? JSON.parse(stored) : [];

      const existingIndex = proposals.findIndex((p) => p.id === proposal.id);

      if (existingIndex >= 0) {
        proposals[existingIndex] = proposal;
      } else {
        proposals.push(proposal);
      }

      localStorage.setItem(
        "storycraft-enhanced-proposals",
        JSON.stringify(proposals, (_, value) => {
          if (value instanceof Date) {
            return { __type: "Date", value: value.toISOString() };
          }
          return value;
        }),
      );
    } catch (error) {
      console.error("Error saving enhanced proposal:", error);
      throw new Error("Failed to save enhanced proposal");
    }
  }

  // Get all enhanced proposals
  getAllEnhancedProposals(): EnhancedProposal[] {
    try {
      const stored = localStorage.getItem("storycraft-enhanced-proposals");
      if (!stored) return [];

      const parsed = JSON.parse(stored, (_, value) => {
        if (value && typeof value === "object" && value.__type === "Date") {
          return new Date(value.value);
        }
        return value;
      });

      return parsed.map((proposal: any) => ({
        ...proposal,
        createdAt:
          proposal.createdAt instanceof Date
            ? proposal.createdAt
            : new Date(proposal.createdAt || Date.now()),
        updatedAt:
          proposal.updatedAt instanceof Date
            ? proposal.updatedAt
            : new Date(proposal.updatedAt || Date.now()),
        extractedInformation: {
          ...proposal.extractedInformation,
          lastUpdated:
            proposal.extractedInformation.lastUpdated instanceof Date
              ? proposal.extractedInformation.lastUpdated
              : new Date(
                  proposal.extractedInformation.lastUpdated || Date.now(),
                ),
        },
        generatedContent: {
          ...proposal.generatedContent,
          lastGenerated:
            proposal.generatedContent.lastGenerated instanceof Date
              ? proposal.generatedContent.lastGenerated
              : new Date(proposal.generatedContent.lastGenerated || Date.now()),
        },
      }));
    } catch (error) {
      console.error("Error loading enhanced proposals:", error);
      return [];
    }
  }

  // Get enhanced proposal by ID
  getEnhancedProposalById(id: string): EnhancedProposal | null {
    const proposals = this.getAllEnhancedProposals();
    return proposals.find((p) => p.id === id) || null;
  }

  // Delete enhanced proposal
  async deleteEnhancedProposal(id: string): Promise<boolean> {
    try {
      const proposals = this.getAllEnhancedProposals();
      const filteredProposals = proposals.filter((p) => p.id !== id);

      localStorage.setItem(
        "storycraft-enhanced-proposals",
        JSON.stringify(filteredProposals, (_, value) => {
          if (value instanceof Date) {
            return { __type: "Date", value: value.toISOString() };
          }
          return value;
        }),
      );

      return true;
    } catch (error) {
      console.error("Error deleting enhanced proposal:", error);
      return false;
    }
  }
}

// Hook for using proposals with live updates from TanStack DB
export function useProposalsData() {
  // Use live query to get reactive updates from the collection
  const { data: proposals = [], isReady } = useLiveQuery(proposalCollection);

  return {
    proposals: Array.isArray(proposals)
      ? proposals
      : Object.values(proposals || {}),
    isLoading: !isReady,
  };
}

// Export singleton instance
export const proposalDbService = ProposalDbService.getInstance();
