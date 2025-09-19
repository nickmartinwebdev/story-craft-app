export interface ProposalMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface SavedProposal {
  id: string;
  title: string;
  description: string;
  messages: ProposalMessage[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
}

export interface ProposalFilters {
  status?: 'draft' | 'in-progress' | 'completed' | 'archived' | 'all';
  tags?: string[];
  searchQuery?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

export type ProposalSortBy = 'title' | 'createdAt' | 'updatedAt' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface ProposalSortOptions {
  sortBy: ProposalSortBy;
  order: SortOrder;
}
