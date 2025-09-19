# Proposals Management Features

## Overview

This document describes the new proposal management features implemented in the StoryCraft application. These features allow users to save, manage, and revisit their proposal discussions with an AI assistant.

## Features Implemented

### 1. Save Proposal Discussions ✅
- **Save Current Chat**: Users can save their ongoing conversation with the AI assistant
- **Auto-Title Generation**: System automatically generates meaningful titles from conversation content
- **Custom Titles**: Users can provide custom titles when saving
- **Metadata Support**: Add descriptions, tags, and status to saved proposals
- **Local Storage**: All data is persisted in browser localStorage for front-end only operation

### 2. Saved Proposals List ✅
- **Comprehensive List View**: Display all saved proposals in an organized list
- **Rich Metadata Display**: Shows title, description, status, tags, creation/update dates, and message count
- **Status Badges**: Visual indicators for proposal status (draft, in-progress, completed, archived)
- **Quick Actions**: Menu-driven actions for viewing, editing, and deleting proposals

### 3. Sorting and Filtering ✅
- **Multiple Sort Options**:
  - By Title (A-Z)
  - By Created Date (newest/oldest first)
  - By Updated Date (newest/oldest first)
  - By Status (alphabetical)
- **Advanced Filters**:
  - Search by title, description, or tags
  - Filter by status (all, draft, in-progress, completed, archived)
  - Filter by tags (multi-select with OR logic)
  - Date range filtering (planned for future enhancement)
- **Real-time Updates**: Filters and sorting apply instantly without page refresh

### 4. Create New Proposals ✅
- **Fresh Start**: Users can initiate new proposal discussions
- **Clean Chat Interface**: Each new proposal starts with default AI welcome messages
- **Context Preservation**: New proposals maintain the same AI capabilities and context

### 5. Delete Proposals ✅
- **Safe Deletion**: Confirmation modal prevents accidental deletions
- **Cascade Updates**: Deleting current proposal cleans up active chat state
- **Immediate UI Updates**: List refreshes automatically after deletion

## Technical Implementation

### Architecture
- **TanStack DB**: Collection-based data management with query capabilities
- **React Context**: `ProposalsProvider` manages global state
- **TypeScript**: Full type safety with defined interfaces
- **Mantine UI**: Consistent design system integration
- **Pluggable Storage**: Easy swap between localStorage and future database backends

### Key Components
- **ProposalsContext**: Global state management with TanStack DB integration
- **SavedProposalsList**: List view with filtering/sorting
- **ProposalSaveDialog**: Save/edit modal interface
- **ProposalDbService**: TanStack DB abstraction layer
- **ProposalCollection**: TanStack DB collection with mutation handlers
- **ProposalCollectionService**: Business logic and utility functions

### Data Structure
```typescript
interface SavedProposal {
  id: string;
  title: string;
  description: string;
  messages: ProposalMessage[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
}
```

## User Experience

### Navigation
- **Tabbed Interface**: Switch between active chat and saved proposals
- **Seamless Flow**: Easy transitions between creating, saving, and loading proposals
- **Visual Feedback**: Loading states, success notifications, and error handling

### Chat Integration
- **Save Button**: Prominent save action in chat interface
- **Auto-save**: Proposals update when messages change
- **Context Awareness**: AI maintains conversation quality across save/load cycles

### List Management
- **Search and Filter**: Find specific proposals quickly
- **Bulk Operations**: Future enhancement for batch actions
- **Export Capability**: Planned feature for sharing proposals

## Storage and Performance

### TanStack DB Collection
- **Reactive Updates**: Live queries automatically update UI when data changes
- **Optimistic Mutations**: Instant UI updates with rollback on error
- **Mutation Handlers**: Structured insert/update/delete operations
- **Query Integration**: Built on TanStack Query for consistent data management
- **Type Safety**: Full TypeScript support with schema validation

### Current Storage Backend (localStorage)
- **Serialization**: Custom JSON serialization with Date handling
- **Error Handling**: Graceful degradation when storage is unavailable
- **Size Management**: Efficient storage of conversation data
- **Easy Migration**: Ready to swap for database backend

### Performance Optimizations
- **Live Queries**: Real-time updates without manual state management
- **Collection State**: Efficient in-memory data structure
- **Optimistic Updates**: Instant feedback with server sync
- **Debounced Filtering**: Smooth search experience
- **Memory Management**: Proper cleanup of event listeners and subscriptions

## Future Enhancements

### Planned Features
1. **Cloud Sync**: Backend integration for cross-device access
2. **Collaboration**: Share proposals with team members
3. **Export Options**: PDF, Word, and markdown export
4. **Templates**: Pre-built proposal templates
5. **Version History**: Track changes over time
6. **Advanced Analytics**: Proposal success metrics

### Technical Improvements
1. **Database Integration**: Swap TanStack DB backend from localStorage to PostgreSQL/Supabase
2. **Real-time Updates**: WebSocket integration for live collaboration using TanStack DB streams
3. **Full-text Search**: Enhanced search capabilities with database indices
4. **Offline Support**: Service worker with TanStack DB sync strategies
5. **ElectricSQL Integration**: Real-time local-first database sync
6. **Query Optimization**: Advanced filtering and pagination with TanStack DB

## Usage Guide

### Saving a Proposal
1. Start a conversation with the AI assistant
2. Click the save icon (💾) in the chat header
3. Add title, description, tags, and status
4. Click "Save Proposal"

### Managing Saved Proposals
1. Navigate to "Saved Proposals" tab
2. Use search bar to find specific proposals
3. Apply filters by status or tags
4. Sort by different criteria using sort buttons
5. Use the menu (⋯) on each proposal for actions

### Loading a Saved Proposal
1. Go to "Saved Proposals" tab
2. Find your proposal using search/filters
3. Click "View/Edit" from the proposal menu
4. Continue the conversation from where you left off

## Browser Compatibility

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Data Privacy

- **Local Storage Only**: Current implementation keeps all data in browser
- **No Tracking**: No analytics or tracking of proposal content
- **User Control**: Complete ownership of data with export/delete capabilities
- **Future-Ready**: TanStack DB architecture ready for secure server sync when needed

## TanStack DB Implementation Details

### Collection Structure
```typescript
// Collection with localStorage backend
const proposalCollection = createCollection(
  queryCollectionOptions<SavedProposal>({
    queryKey: ["proposals"],
    queryFn: () => loadProposalsFromStorage(),
    queryClient,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      // Handle optimistic inserts with localStorage persistence
    },
    onUpdate: async ({ transaction }) => {
      // Handle optimistic updates with localStorage persistence  
    },
    onDelete: async ({ transaction }) => {
      // Handle optimistic deletes with localStorage persistence
    }
  })
);
```

### Live Query Usage
```typescript
// Reactive data access
const { data: proposals, isReady } = useLiveQuery(proposalCollection);

// Optimistic mutations
proposalCollection.insert(newProposal);
proposalCollection.update(id, draft => { draft.title = "Updated" });
proposalCollection.delete(id);
```

### Easy Backend Swap
The current localStorage implementation can be easily swapped for:
- **Supabase**: Real-time database with row-level security
- **Firebase**: NoSQL with real-time updates
- **PostgreSQL**: Traditional relational database
- **ElectricSQL**: Local-first sync with PostgreSQL
- **Custom API**: REST/GraphQL backend integration

Simply update the mutation handlers in `proposalCollection.ts`:
```typescript
onInsert: async ({ transaction }) => {
  // Change from localStorage to API call
  const response = await api.proposals.create(transaction.mutations[0].modified);
  return { txid: response.txid };
}
```

---

*Last Updated: January 2025*
*Version: 1.0.0*