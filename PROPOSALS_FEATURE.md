# Proposals Feature Documentation

## Overview

The Proposals feature is a new addition to the StoryCraft application that provides users with an AI-powered chat interface to help create, refine, and improve project proposals. This feature includes a redesigned navigation system with a sidebar layout and a comprehensive chat interface.

## Features

### 1. Navigation Sidebar

- **Responsive Design**: Collapsible sidebar for mobile devices with hamburger menu
- **Visual Feedback**: Active state indicators and hover animations
- **User Menu**: Integrated user profile menu in the header with sign-out functionality
- **Navigation Items**:
  - Dashboard
  - Proposals (new)
  - Profile
  - Settings

### 2. Proposals Chat Interface

#### Core Functionality
- **Real-time Chat**: Interactive conversation with AI assistant
- **Message History**: Persistent conversation within session
- **Typing Indicators**: Animated dots showing AI is processing
- **Quick Starters**: Pre-defined conversation starters for new users

#### AI Assistant Capabilities
- **Context-aware responses** based on keywords (budget, timeline, team, risks)
- **Proposal structuring** guidance
- **Budget planning** assistance
- **Timeline management** advice
- **Risk assessment** support
- **Stakeholder analysis** help

#### User Experience
- **Smooth animations** for message appearance
- **Visual message distinction** between user and AI messages
- **Timestamp display** for all messages
- **Auto-scrolling** to latest messages
- **Clear conversation** functionality

## Technical Implementation

### Components Created

1. **NavigationLayout** (`src/components/NavigationLayout.tsx`)
   - AppShell-based layout with sidebar navigation
   - Responsive design with Mantine components
   - User authentication integration

2. **ProposalsPage** (`src/routes/_authenticated/proposals.tsx`)
   - Full chat interface implementation
   - Mock AI responses with contextual awareness
   - State management for messages and UI states

3. **TypingIndicator** (`src/components/TypingIndicator.tsx`)
   - Animated typing indicator with CSS animations
   - Configurable size options

4. **Profile & Settings Pages**
   - Basic placeholder pages for navigation completeness

### Routes Structure
```
/_authenticated/
├── dashboard.tsx
├── proposals.tsx (new)
├── profile.tsx (new)
└── settings.tsx (new)
```

### Key Features

#### Message Types
- User messages: Right-aligned with blue background
- AI messages: Left-aligned with light gray background
- System messages: Welcome and help information

#### Quick Start Options
- "I need to write a project proposal for a new software system"
- "Help me create a budget proposal for my department"
- "I'm writing a research grant proposal - where should I start?"
- "I need to propose a new marketing campaign to leadership"

#### Contextual AI Responses
The AI assistant provides different types of responses based on detected keywords:

- **Budget-related**: Cost breakdowns, ROI analysis, budget planning
- **Timeline-related**: Project scheduling, milestone planning, dependency management
- **Team-related**: Resource allocation, skill requirements, capacity planning
- **Risk-related**: Risk assessment, mitigation strategies, contingency planning

## Usage

### Accessing Proposals
1. Sign in to the application
2. Navigate using the sidebar to "Proposals"
3. Start chatting with the AI assistant

### Chat Interface
- Type messages in the input field at the bottom
- Press Enter or click the send button to send
- Use quick start buttons for common scenarios
- Clear conversation history with the "Clear Conversation" button

### Navigation
- Use the sidebar to switch between different sections
- The active page is highlighted in the navigation
- User menu in the top right provides profile options

## Future Enhancements

### Proposed Features
1. **Real API Integration**: Replace mock responses with actual LLM API
2. **Conversation Persistence**: Save chat history to database
3. **File Uploads**: Allow users to upload existing proposals for analysis
4. **Export Functionality**: Generate downloadable proposal documents
5. **Templates**: Pre-built proposal templates for different industries
6. **Collaboration**: Share proposals with team members
7. **Version Control**: Track proposal changes over time

### Technical Improvements
1. **Performance**: Implement message virtualization for long conversations
2. **Accessibility**: Enhanced screen reader support
3. **Mobile Experience**: Improved mobile chat interface
4. **Offline Support**: Basic offline functionality
5. **Search**: Search through conversation history

## Dependencies

- **@mantine/core**: UI components and layout
- **@tabler/icons-react**: Icons for navigation and interface
- **@tanstack/react-router**: Routing and navigation
- React hooks for state management

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Initial bundle size: ~677KB (209KB gzipped)
- Chat interface is optimized for real-time interactions
- Smooth animations with 60fps performance target
- Responsive design works on screens from 320px to 4K

---

*Last updated: January 2025*