import {
  SavedProposal,
  ProposalMessage,
  ProposalFilters,
  ProposalSortOptions,
} from "../types/proposals";

const STORAGE_KEY = "storycraft-proposals";

export class ProposalStorageService {
  private static instance: ProposalStorageService;

  static getInstance(): ProposalStorageService {
    if (!ProposalStorageService.instance) {
      ProposalStorageService.instance = new ProposalStorageService();
    }
    return ProposalStorageService.instance;
  }

  private serialize(data: any): string {
    return JSON.stringify(data, (_, value) => {
      if (value instanceof Date) {
        return { __type: "Date", value: value.toISOString() };
      }
      return value;
    });
  }

  private deserialize(json: string): any {
    return JSON.parse(json, (_, value) => {
      if (value && typeof value === "object" && value.__type === "Date") {
        return new Date(value.value);
      }
      return value;
    });
  }

  getAllProposals(): SavedProposal[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return this.deserialize(stored) as SavedProposal[];
    } catch (error) {
      console.error("Error reading proposals from storage:", error);
      return [];
    }
  }

  saveProposal(proposal: SavedProposal): void {
    try {
      const proposals = this.getAllProposals();
      const existingIndex = proposals.findIndex((p) => p.id === proposal.id);

      if (existingIndex >= 0) {
        proposals[existingIndex] = { ...proposal, updatedAt: new Date() };
      } else {
        proposals.push(proposal);
      }

      localStorage.setItem(STORAGE_KEY, this.serialize(proposals));
    } catch (error) {
      console.error("Error saving proposal to storage:", error);
      throw new Error("Failed to save proposal");
    }
  }

  getProposalById(id: string): SavedProposal | null {
    const proposals = this.getAllProposals();
    return proposals.find((p) => p.id === id) || null;
  }

  deleteProposal(id: string): boolean {
    try {
      const proposals = this.getAllProposals();
      const filteredProposals = proposals.filter((p) => p.id !== id);

      if (filteredProposals.length === proposals.length) {
        return false; // Proposal not found
      }

      localStorage.setItem(STORAGE_KEY, this.serialize(filteredProposals));
      return true;
    } catch (error) {
      console.error("Error deleting proposal from storage:", error);
      throw new Error("Failed to delete proposal");
    }
  }

  updateProposalMessages(id: string, messages: ProposalMessage[]): boolean {
    try {
      const proposals = this.getAllProposals();
      const proposalIndex = proposals.findIndex((p) => p.id === id);

      if (proposalIndex === -1) {
        return false;
      }

      proposals[proposalIndex].messages = messages;
      proposals[proposalIndex].updatedAt = new Date();

      localStorage.setItem(STORAGE_KEY, this.serialize(proposals));
      return true;
    } catch (error) {
      console.error("Error updating proposal messages:", error);
      throw new Error("Failed to update proposal messages");
    }
  }

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
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case "updatedAt":
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
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

  getAllTags(): string[] {
    const proposals = this.getAllProposals();
    const tagSet = new Set<string>();

    proposals.forEach((proposal) => {
      proposal.tags.forEach((tag) => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
  }

  generateProposalId(): string {
    return `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  extractTitleFromMessages(messages: ProposalMessage[]): string {
    // Try to find a meaningful title from the conversation
    const userMessages = messages.filter((m) => m.isUser);

    if (userMessages.length === 0) {
      return "New Proposal";
    }

    const firstUserMessage = userMessages[0].content;

    // Extract first sentence or first 50 characters
    const sentences = firstUserMessage.split(/[.!?]+/);
    const title = sentences[0]?.trim() || firstUserMessage;

    return title.length > 50 ? title.substring(0, 50) + "..." : title;
  }

  createProposalFromMessages(
    messages: ProposalMessage[],
    title?: string,
  ): SavedProposal {
    const id = this.generateProposalId();
    const now = new Date();

    return {
      id,
      title: title || this.extractTitleFromMessages(messages),
      description:
        messages.length > 0
          ? messages[0].content.substring(0, 200) + "..."
          : "",
      messages,
      createdAt: now,
      updatedAt: now,
      tags: [],
      status: "draft",
    };
  }
}

export const proposalStorage = ProposalStorageService.getInstance();
