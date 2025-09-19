# Infinite Loop Fix Documentation

## Problem Description

When trying to create a new proposal, the application was throwing the following error:

```
Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.
```

## Root Cause Analysis

The infinite loop was caused by circular dependencies in the state management between the `ProposalsContext` and the `proposals.tsx` component:

### Original Problematic Flow
1. Component state `messages` changes
2. `useEffect` calls `updateCurrentProposalMessages(messages)`
3. Context updates `currentProposal` with new messages
4. Another `useEffect` detects `currentProposal` change
5. Component calls `setMessages(currentProposal.messages)`
6. **Loop back to step 1** ♻️

### Specific Issues Identified

1. **Circular useEffect Dependencies**:
   ```typescript
   // This caused the infinite loop
   useEffect(() => {
     if (currentProposal) {
       setMessages(currentProposal.messages);
     }
   }, [currentProposal]); // ❌ Triggers when proposal updates

   useEffect(() => {
     if (currentProposal) {
       updateCurrentProposalMessages(messages);
     }
   }, [messages, currentProposal, updateCurrentProposalMessages]); // ❌ Triggers when messages change
   ```

2. **Unstable Callback Dependencies**:
   ```typescript
   // This recreated the callback on every proposal change
   const updateCurrentProposalMessages = useCallback(
     (messages: ProposalMessage[]) => {
       // ... update logic
     },
     [currentProposal], // ❌ Causes callback to change when proposal changes
   );
   ```

## Solution Implementation

### 1. Remove Local Messages State
**Before**: Maintained separate `messages` state that needed synchronization
```typescript
const [messages, setMessages] = useState<ProposalMessage[]>([]);
```

**After**: Derive messages directly from proposal or use defaults
```typescript
const messages = currentProposal?.messages || defaultMessages;
```

### 2. Fix Callback Dependencies
**Before**: Callback dependency on `currentProposal` caused recreation
```typescript
const updateCurrentProposalMessages = useCallback(
  (messages: ProposalMessage[]) => { /* ... */ },
  [currentProposal], // ❌ Problematic dependency
);
```

**After**: Stable callback with no external dependencies
```typescript
const updateCurrentProposalMessages = useCallback(
  (messages: ProposalMessage[]) => {
    setCurrentProposal((prev) => {
      if (!prev) return null;
      const messagesChanged = JSON.stringify(prev.messages) !== JSON.stringify(messages);
      if (!messagesChanged) return prev;
      return { ...prev, messages, updatedAt: new Date() };
    });
  },
  [], // ✅ Stable callback
);
```

### 3. Eliminate Circular useEffects
**Before**: Two useEffects creating circular updates
```typescript
useEffect(() => {
  if (currentProposal) {
    setMessages(currentProposal.messages);
  }
}, [currentProposal]);

useEffect(() => {
  if (currentProposal) {
    updateCurrentProposalMessages(messages);
  }
}, [messages, currentProposal, updateCurrentProposalMessages]);
```

**After**: Direct updates in event handlers, no circular effects
```typescript
// Update proposal directly in message handling functions
const handleSendMessage = async () => {
  // ... message logic
  const updatedMessages = [...messages, userMessage];
  
  if (currentProposal) {
    updateCurrentProposalMessages(updatedMessages); // ✅ Direct update
  }
};
```

### 4. Add Message Comparison Safeguard
```typescript
const messagesChanged = JSON.stringify(prev.messages) !== JSON.stringify(messages);
if (!messagesChanged) return prev; // ✅ Prevent unnecessary updates
```

### 5. Simplify Clear Conversation Logic
**Before**: Always called `updateCurrentProposalMessages` even without proposal
```typescript
const clearConversation = () => {
  const defaultMessages = [/* ... */];
  setMessages(defaultMessages);
  updateCurrentProposalMessages(defaultMessages); // ❌ Could update non-existent proposal
};
```

**After**: Conditional updates only when proposal exists
```typescript
const clearConversation = () => {
  if (currentProposal) {
    const defaultMessages = [/* ... */];
    updateCurrentProposalMessages(defaultMessages); // ✅ Only update existing proposals
  }
};
```

## Key Principles Applied

### 1. Single Source of Truth
- Messages are derived from `currentProposal.messages` or defaults
- No duplicate state that needs synchronization

### 2. Unidirectional Data Flow
- User actions → Direct proposal updates → UI renders
- No circular state dependencies

### 3. Stable Function References
- Callbacks don't recreate unless truly necessary
- Removed problematic dependencies from useCallback

### 4. Defensive Programming
- Check for proposal existence before updates
- Compare data before applying changes
- Early returns to prevent unnecessary operations

## Testing the Fix

### Before Fix
1. Click "New Proposal"
2. **Result**: Infinite loop error, app crashes

### After Fix
1. Click "New Proposal" ✅ Works
2. Type messages ✅ Updates properly
3. Save proposal ✅ Persists correctly
4. Load saved proposal ✅ Displays correctly
5. Switch between chat/saved tabs ✅ No issues

## Prevention Guidelines

To avoid similar issues in the future:

1. **Avoid Circular Dependencies**: Be careful with useEffect dependencies that can trigger each other
2. **Single Source of Truth**: Don't duplicate state that needs synchronization
3. **Stable Callbacks**: Use empty dependency arrays when possible for useCallback
4. **Direct Updates**: Update state directly in event handlers rather than through effects
5. **Defensive Checks**: Always verify data exists before operations

## Performance Impact

### Memory Usage
- **Reduced**: Eliminated duplicate state storage
- **Improved**: Fewer React re-renders due to stable callbacks

### Rendering Performance
- **Better**: No more infinite re-render cycles
- **Smoother**: More predictable update patterns

### Developer Experience
- **Cleaner**: Simpler state management logic
- **Debuggable**: Easier to trace data flow

---

**Fix Applied**: January 2025  
**Status**: ✅ Resolved  
**Verified**: All core functionality working correctly