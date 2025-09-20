# Testing Navigation Features

This document describes the testing features added to the Enhanced Proposals workflow to allow developers and testers to quickly navigate between different phases of the story generation process.

## Overview

The Enhanced Proposals workflow consists of four phases:
1. **Information Gathering** - Extract personas, goals, contexts, constraints, and assumptions
2. **Story Formation** - Generate user stories from extracted information
3. **Epic Creation** - Group stories into epics
4. **Refinement** - Final review and editing of stories and epics

## Testing Menu

A testing menu has been added to the Enhanced Proposals page header (three dots menu) with the following options:

### Phase Navigation Options

#### `[TEST] Go to Stories`
- **Purpose**: Quickly jump from information gathering to story formation phase
- **Behavior**: 
  - If in information-gathering phase: transitions to story-formation
  - If already in later phase: shows notification with current phase
- **Use Case**: Test story generation UI without going through full information gathering

#### `[TEST] Go to Epics`
- **Purpose**: Jump directly to epic creation phase
- **Behavior**:
  - From information-gathering: transitions through story-formation to epic-creation
  - From story-formation: transitions to epic-creation
  - If already in later phase: shows notification with current phase
- **Use Case**: Test epic generation and grouping features

#### `[TEST] Go to Refinement`
- **Purpose**: Jump directly to the final refinement phase
- **Behavior**:
  - Transitions through all intermediate phases to reach refinement
  - Uses timed transitions (100ms intervals) to avoid race conditions
- **Use Case**: Test the complete tabbed interface with both stories and epics

### Data Population Option

#### `[TEST] Add Sample Data`
- **Purpose**: Populate the system with realistic test data
- **Behavior**: Adds sample personas, goals, contexts, constraints, and assumptions
- **Sample Data Includes**:
  - **Personas**: Sarah (Project Manager) and Mike (Developer)
  - **Goals**: Team productivity and project visibility
  - **Contexts**: Remote team environment
  - **Constraints**: Budget and legacy system integration
  - **Assumptions**: User adoption patterns

## Usage Instructions

### Quick Story Testing Workflow
1. Navigate to Enhanced Proposals page
2. Click the three dots menu (⋯) in the header
3. Select `[TEST] Add Sample Data` to populate with realistic data
4. Select `[TEST] Go to Stories` to jump to story formation phase
5. Test story generation, editing, and viewing features

### Full Workflow Testing
1. Add sample data as above
2. Select `[TEST] Go to Refinement` to see the complete interface
3. Test tabbed navigation between stories and epics
4. Test all CRUD operations on stories and epics

### Phase-by-Phase Testing
- Use individual phase navigation options to test specific features
- Each transition shows a notification confirming the phase change
- Sample data remains available across all phases

## Implementation Details

### Code Location
- **File**: `src/routes/_authenticated/enhanced-proposals.tsx`
- **Menu Location**: Lines 340-560 (in header menu dropdown)
- **Context Integration**: Uses existing `transitionToNextPhase` and `updateExtractedInformation` functions

### Sample Data Structure
The sample data follows the exact TypeScript interfaces defined in `src/types/enhanced-proposals.ts`:
- `UserPersona` with behaviors and extractedFrom fields
- `ProjectGoal` with measurable metrics
- `BusinessContext` with impact levels
- `Constraint` with severity classifications
- `Assumption` with validation requirements

### Notifications
All testing actions show toast notifications using Mantine's notification system:
- **Orange**: Phase transitions
- **Teal**: Data population
- **Blue**: Status information

## Best Practices for Testing

1. **Start Fresh**: Use "Reset Workflow" before beginning tests
2. **Use Sample Data**: Always populate sample data before testing story generation
3. **Test Transitions**: Verify that phase transitions work correctly in both directions
4. **Check Persistence**: Ensure data persists across phase changes
5. **Validate UI**: Check that the correct UI components render for each phase

## Troubleshooting

### Common Issues
- **Empty Stories**: Ensure sample data is populated before generating stories
- **Phase Stuck**: Use "Reset Workflow" and try again
- **UI Not Updating**: Refresh the page if components don't re-render

### Reset Options
- **Reset Workflow**: Clears all data and returns to information gathering
- **Clear Conversation**: Removes chat messages but keeps extracted data

## Future Enhancements

Potential additional testing features:
- **Custom Sample Data**: Allow editing of sample data before population
- **Phase Validation**: Test that transitions respect business rules
- **Performance Testing**: Measure generation times for large datasets
- **Export/Import**: Save and restore test scenarios