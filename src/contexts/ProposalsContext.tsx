import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  SavedProposal,
  ProposalMessage,
  ProposalFilters,
  ProposalSortOptions,
} from "../types/proposals";
import { proposalDbService } from "../services/proposalDbService";

interface ProposalsContextType {
  proposals: SavedProposal[];
  currentProposal: SavedProposal | null;
  filters: ProposalFilters;
  sortOptions: ProposalSortOptions;
  isLoading: boolean;

  // Actions
  loadProposals: () => void;
  saveProposal: (proposal: SavedProposal) => Promise<void>;
  deleteProposal: (id: string) => Promise<void>;
  loadProposal: (id: string) => void;
  createNewProposal: () => void;
  updateCurrentProposalMessages: (messages: ProposalMessage[]) => void;
  saveCurrentProposal: (title?: string) => Promise<SavedProposal>;

  // Filtering and sorting
  setFilters: (filters: ProposalFilters) => void;
  setSortOptions: (sortOptions: ProposalSortOptions) => void;
  getFilteredProposals: () => SavedProposal[];
  getAllTags: () => string[];
}

const ProposalsContext = createContext<ProposalsContextType | undefined>(
  undefined,
);

interface ProposalsProviderProps {
  children: React.ReactNode;
}

export function ProposalsProvider({ children }: ProposalsProviderProps) {
  const [proposals, setProposals] = useState<SavedProposal[]>([]);
  const [currentProposal, setCurrentProposal] = useState<SavedProposal | null>(
    null,
  );
  const [filters, setFilters] = useState<ProposalFilters>({});
  const [sortOptions, setSortOptions] = useState<ProposalSortOptions>({
    sortBy: "updatedAt",
    order: "desc",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load all proposals from TanStack DB
  const loadProposals = useCallback(() => {
    setIsLoading(true);
    try {
      const loadedProposals = proposalDbService.getAllProposals();
      setProposals(loadedProposals);
    } catch (error) {
      console.error("Failed to load proposals:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save a proposal
  const saveProposal = useCallback(
    async (proposal: SavedProposal) => {
      try {
        await proposalDbService.saveProposal(proposal);
        loadProposals(); // Reload to get updated list
      } catch (error) {
        console.error("Failed to save proposal:", error);
        throw error;
      }
    },
    [loadProposals],
  );

  // Delete a proposal
  const deleteProposal = useCallback(
    async (id: string) => {
      try {
        const success = await proposalDbService.deleteProposal(id);
        if (success) {
          loadProposals(); // Reload to get updated list
          // Clear current proposal if it was deleted
          if (currentProposal?.id === id) {
            setCurrentProposal(null);
          }
        } else {
          throw new Error("Proposal not found");
        }
      } catch (error) {
        console.error("Failed to delete proposal:", error);
        throw error;
      }
    },
    [currentProposal?.id, loadProposals],
  );

  // Load a specific proposal
  const loadProposal = useCallback((id: string) => {
    const proposal = proposalDbService.getProposalById(id);
    setCurrentProposal(proposal);
  }, []);

  // Create a new proposal - always creates a temporary draft
  const createNewProposal = useCallback(() => {
    const now = new Date();
    const newProposal: SavedProposal = {
      id: proposalDbService.generateProposalId(),
      title: "New Proposal Draft",
      description: "",
      messages: [
        {
          id: "1",
          content:
            "🚀 **Context7-Powered Proposals Assistant**\n\nI'm your AI assistant with Context7-inspired intelligence for creating world-class proposals that get approved and funded.",
          isUser: false,
          timestamp: new Date(now.getTime()),
        },
        {
          id: "2",
          content:
            "✨ **Smart Capabilities**:\n• **Context-Aware Analysis**: I analyze your input patterns for targeted advice\n• **Framework-Based Guidance**: Strategic, financial, technical, and operational insights\n• **Real-World Examples**: Industry best practices and proven methodologies\n• **Risk Intelligence**: Proactive identification and mitigation strategies\n\n💡 **Pro Tip**: The more specific you are, the more targeted my guidance becomes!\n\nWhat kind of proposal challenge can I help you solve?",
          isUser: false,
          timestamp: new Date(now.getTime() + 1),
        },
      ],
      createdAt: new Date(now.getTime()),
      updatedAt: new Date(now.getTime()),
      tags: [],
      status: "draft",
    };
    setCurrentProposal(newProposal);
  }, []);

  // Update current proposal messages - ensures proposal exists
  const updateCurrentProposalMessages = useCallback(
    (messages: ProposalMessage[]) => {
      setCurrentProposal((prev) => {
        // If no current proposal exists, return null and let the useEffect handle creation
        if (!prev) {
          return null;
        }

        // Check if messages are actually different to prevent unnecessary updates
        if (prev.messages.length === messages.length) {
          let messagesIdentical = true;
          for (let i = 0; i < messages.length; i++) {
            if (
              prev.messages[i]?.id !== messages[i]?.id ||
              prev.messages[i]?.content !== messages[i]?.content
            ) {
              messagesIdentical = false;
              break;
            }
          }
          if (messagesIdentical) {
            return prev;
          }
        }

        return {
          ...prev,
          messages,
          updatedAt: new Date(Date.now()),
        };
      });
    },
    [],
  );

  // Save current proposal - creates one if needed
  const saveCurrentProposal = useCallback(
    async (title?: string): Promise<SavedProposal> => {
      let proposal = currentProposal;

      // Create a proposal if none exists
      if (!proposal) {
        const now = new Date(Date.now());
        proposal = {
          id: proposalDbService.generateProposalId(),
          title: title || "New Proposal",
          description: "",
          messages: [
            {
              id: "1",
              content:
                "🚀 **Context7-Powered Proposals Assistant**\n\nI'm your AI assistant with Context7-inspired intelligence for creating world-class proposals that get approved and funded.",
              isUser: false,
              timestamp: new Date(now.getTime()),
            },
            {
              id: "2",
              content:
                "✨ **Smart Capabilities**:\n• **Context-Aware Analysis**: I analyze your input patterns for targeted advice\n• **Framework-Based Guidance**: Strategic, financial, technical, and operational insights\n• **Real-World Examples**: Industry best practices and proven methodologies\n• **Risk Intelligence**: Proactive identification and mitigation strategies\n\n💡 **Pro Tip**: The more specific you are, the more targeted my guidance becomes!\n\nWhat kind of proposal challenge can I help you solve?",
              isUser: false,
              timestamp: new Date(now.getTime() + 1),
            },
          ],
          createdAt: new Date(now.getTime()),
          updatedAt: new Date(now.getTime()),
          tags: [],
          status: "draft",
        };
        setCurrentProposal(proposal);
      }

      const proposalToSave: SavedProposal = {
        ...proposal,
        title:
          title ||
          proposalDbService.extractTitleFromMessages(proposal.messages),
        updatedAt: new Date(Date.now()),
      };

      await saveProposal(proposalToSave);
      setCurrentProposal(proposalToSave);
      return proposalToSave;
    },
    [currentProposal, saveProposal],
  );

  // Get filtered and sorted proposals
  const getFilteredProposals = useCallback(() => {
    return proposalDbService.filterAndSortProposals(filters, sortOptions);
  }, [filters, sortOptions]);

  // Get all tags
  const getAllTags = useCallback(() => {
    return proposalDbService.getAllTags();
  }, []);

  // Load proposals on mount and ensure we have a current proposal
  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  const value: ProposalsContextType = {
    proposals,
    currentProposal,
    filters,
    sortOptions,
    isLoading,
    loadProposals,
    saveProposal,
    deleteProposal,
    loadProposal,
    createNewProposal,
    updateCurrentProposalMessages,
    saveCurrentProposal,
    setFilters,
    setSortOptions,
    getFilteredProposals,
    getAllTags,
  };

  return (
    <ProposalsContext.Provider value={value}>
      {children}
    </ProposalsContext.Provider>
  );
}

export function useProposals() {
  const context = useContext(ProposalsContext);
  if (context === undefined) {
    throw new Error("useProposals must be used within a ProposalsProvider");
  }
  return context;
}
