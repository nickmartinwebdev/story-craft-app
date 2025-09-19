# TanStack DB Migration Guide

## Overview

This document describes the migration from a simple localStorage-based storage system to TanStack DB collections for proposal management. This architectural change provides better abstraction, reactive updates, optimistic mutations, and easy backend swapping capabilities.

## Migration Summary

### Before: localStorage Implementation
- Direct localStorage read/write operations
- Manual serialization/deserialization
- Synchronous data access
- Manual state management
- Tightly coupled to localStorage

### After: TanStack DB Implementation
- Collection-based data management
- Reactive live queries
- Optimistic mutations with rollback
- Pluggable storage backends
- Type-safe operations

## Key Changes

### 1. Data Layer Architecture

#### Old Implementation
```typescript
// utils/proposalStorage.ts
export class ProposalStorageService {
  private serialize(data: any): string {
    return JSON.stringify(data, dateReplacer);
  }
  
  getAllProposals(): SavedProposal[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return this.deserialize(stored);
  }
  
  saveProposal(proposal: SavedProposal): void {
    const proposals = this.getAllProposals();
    // Manual array manipulation
    localStorage.setItem(STORAGE_KEY, this.serialize(proposals));
  }
}
```

#### New Implementation
```typescript
// db/collections/proposalCollection.ts
export const proposalCollection = createCollection(
  queryCollectionOptions<SavedProposal>({
    queryKey: ["proposals"],
    queryFn: async (): Promise<SavedProposal[]> => {
      return loadProposalsFromStorage();
    },
    queryClient,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      // Optimistic insert with persistence
      const newProposals = transaction.mutations.map(m => m.modified);
      // Handle storage persistence
      return { refetch: false };
    }
  })
);
```

### 2. State Management

#### Old Implementation
```typescript
// Manual state management in context
const [proposals, setProposals] = useState<SavedProposal[]>([]);

const loadProposals = useCallback(() => {
  const loaded = proposalStorage.getAllProposals();
  setProposals(loaded); // Manual state update
}, []);
```

#### New Implementation  
```typescript
// Reactive state management with live queries
const { data: proposals = [], isReady } = useLiveQuery(proposalCollection);

// No manual state updates needed - automatically reactive
```

### 3. Mutations

#### Old Implementation
```typescript
// Synchronous mutations
const saveProposal = (proposal: SavedProposal) => {
  proposalStorage.saveProposal(proposal);
  loadProposals(); // Manual refresh
};
```

#### New Implementation
```typescript
// Optimistic mutations
const saveProposal = async (proposal: SavedProposal) => {
  await ProposalCollectionService.insertProposal(proposal);
  // UI updates automatically via live query
};
```

## File Structure Changes

### New Files Added

```
src/
├── db/
│   └── collections/
│       └── proposalCollection.ts      # TanStack DB collection definition
├── services/
│   └── proposalDbService.ts           # Service layer abstraction
└── contexts/
    └── ProposalsContext.tsx           # Updated to use TanStack DB
```

### Files Modified

```
src/
├── contexts/
│   └── ProposalsContext.tsx           # Updated to use new service
└── routes/_authenticated/
    └── proposals.tsx                  # No changes needed
```

### Files Deprecated (kept for reference)

```
src/
└── utils/
    └── proposalStorage.ts             # Original localStorage implementation
```

## Benefits of Migration

### 1. Reactive Updates
- **Before**: Manual state management with useEffect and useState
- **After**: Automatic UI updates via useLiveQuery when data changes

### 2. Optimistic Mutations
- **Before**: Synchronous operations, potential for inconsistent state
- **After**: Optimistic updates with automatic rollback on errors

### 3. Type Safety
- **Before**: Runtime type checking with potential for data corruption
- **After**: Compile-time type safety with schema validation

### 4. Backend Flexibility
- **Before**: Tightly coupled to localStorage
- **After**: Easy to swap backends (localStorage → API → Database)

### 5. Error Handling
- **Before**: Try/catch blocks around every localStorage operation
- **After**: Centralized error handling in mutation handlers

## Usage Examples

### Creating a New Proposal

#### Old Way
```typescript
const createProposal = () => {
  const proposal = proposalStorage.createProposalFromMessages(messages);
  proposalStorage.saveProposal(proposal);
  loadProposals(); // Manual refresh
};
```

#### New Way
```typescript
const createProposal = async () => {
  const proposal = ProposalCollectionService.createProposalFromMessages(messages);
  await ProposalCollectionService.insertProposal(proposal);
  // UI updates automatically
};
```

### Updating a Proposal

#### Old Way
```typescript
const updateProposal = (id: string, changes: Partial<SavedProposal>) => {
  const proposals = proposalStorage.getAllProposals();
  const index = proposals.findIndex(p => p.id === id);
  proposals[index] = { ...proposals[index], ...changes };
  proposalStorage.saveProposal(proposals[index]);
  loadProposals(); // Manual refresh
};
```

#### New Way
```typescript
const updateProposal = async (id: string, changes: Partial<SavedProposal>) => {
  await ProposalCollectionService.updateProposal(id, changes);
  // UI updates automatically via live query
};
```

### Querying Data

#### Old Way
```typescript
// Manual filtering and sorting
const getFilteredProposals = () => {
  let proposals = proposalStorage.getAllProposals();
  
  if (filters.status) {
    proposals = proposals.filter(p => p.status === filters.status);
  }
  
  return proposals.sort((a, b) => /* sorting logic */);
};
```

#### New Way
```typescript
// Service layer handles filtering (could be moved to live queries)
const getFilteredProposals = () => {
  return proposalDbService.filterAndSortProposals(filters, sortOptions);
};

// Future: Live query with built-in filtering
const { data } = useLiveQuery((q) =>
  q.from({ proposal: proposalCollection })
   .where(({ proposal }) => eq(proposal.status, 'draft'))
   .orderBy(({ proposal }) => proposal.updatedAt, 'desc')
);
```

## Backend Migration Path

### Phase 1: Current (localStorage)
```typescript
onInsert: async ({ transaction }) => {
  const currentProposals = loadProposalsFromStorage();
  const newProposals = transaction.mutations.map(m => m.modified);
  saveProposalsToStorage([...currentProposals, ...newProposals]);
}
```

### Phase 2: API Backend
```typescript
onInsert: async ({ transaction }) => {
  const newProposals = transaction.mutations.map(m => m.modified);
  await Promise.all(newProposals.map(proposal => 
    api.proposals.create(proposal)
  ));
}
```

### Phase 3: Real-time Database (Supabase/Firebase)
```typescript
onInsert: async ({ transaction }) => {
  const newProposals = transaction.mutations.map(m => m.modified);
  const results = await supabase
    .from('proposals')
    .insert(newProposals)
    .select();
  
  return { txid: results.data?.[0]?.id };
}
```

### Phase 4: Local-first (ElectricSQL)
```typescript
// ElectricSQL handles sync automatically
export const proposalCollection = createCollection(
  electricCollectionOptions({
    id: 'proposals',
    schema: proposalSchema,
    shapeOptions: {
      url: '/api/electric/proposals',
      params: { table: 'proposals' }
    },
    getKey: (item) => item.id
  })
);
```

## Migration Checklist

### ✅ Completed
- [x] Created TanStack DB collection structure
- [x] Implemented service layer abstraction  
- [x] Updated ProposalsContext to use new service
- [x] Maintained same API interface for components
- [x] Added optimistic mutation support
- [x] Preserved all existing functionality

### 🔄 Future Enhancements
- [ ] Add real-time collaboration with live queries
- [ ] Implement server-side backend integration
- [ ] Add advanced filtering with TanStack DB queries
- [ ] Implement data caching and synchronization strategies
- [ ] Add offline support with sync reconciliation

## Performance Implications

### Memory Usage
- **Before**: Data loaded into component state on demand
- **After**: Data cached in TanStack Query cache with automatic garbage collection

### Network Requests
- **Before**: No network requests (localStorage only)
- **After**: Ready for server requests with built-in caching and deduplication

### Reactivity
- **Before**: Manual dependency tracking with useEffect
- **After**: Automatic dependency tracking with live queries

## Testing Strategy

### Unit Tests
```typescript
// Test collection operations
describe('ProposalCollection', () => {
  it('should insert proposal optimistically', async () => {
    await ProposalCollectionService.insertProposal(mockProposal);
    expect(/* check collection state */).toBeTruthy();
  });
});
```

### Integration Tests
```typescript
// Test service layer
describe('ProposalDbService', () => {
  it('should filter proposals correctly', () => {
    const filtered = proposalDbService.filterAndSortProposals(filters);
    expect(filtered).toMatchSnapshot();
  });
});
```

## Conclusion

The migration to TanStack DB provides a solid foundation for scalable proposal management with the following key advantages:

1. **Better Separation of Concerns**: Clear separation between data layer, business logic, and UI
2. **Future-Proof Architecture**: Easy to migrate between different storage backends
3. **Improved Developer Experience**: Type safety, automatic reactivity, and better error handling
4. **Performance Benefits**: Optimistic updates, efficient caching, and automatic state management
5. **Extensibility**: Ready for advanced features like real-time collaboration and offline support

The current implementation maintains full backward compatibility while providing a path for future enhancements and different storage backends.

---

*Last Updated: January 2025*
*Migration Version: 1.0.0*