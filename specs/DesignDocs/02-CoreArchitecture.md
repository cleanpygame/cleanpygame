# Frontend Architecture Design Document

This document provides an overview of the Clean-Code Game's frontend architecture, focusing on common principles and
patterns. For detailed implementation, refer to the referenced code files.

## Tech Stack

| Part                | Tech                 | Purpose                                               |
|---------------------|----------------------|-------------------------------------------------------|
| Framework           | React                | UI rendering, component model, state management       |
| Syntax Highlighting | prism-react-renderer | Lightweight, read-only syntax highlighting for Python |
| Styling             | Tailwind CSS         | Utility-first styling, matches VS Code feel           |
| Routing             | React Router         | Navigation and URL management                         |
| Backend             | Firebase             | Authentication, database, and hosting                 |

## Core Architecture Principles

The application follows these key architectural principles:

1. **Component-Based Structure**: UI is composed of reusable React components
2. **Centralized State Management**: Global state managed through React Context and reducers
3. **Unidirectional Data Flow**: State changes flow down through props, events flow up through actions
4. **Separation of Concerns**: Components are separated into presentational and container components

## State Management

The application uses a Redux-like pattern with React Context for state management.

### State Structure

The global state is defined in `/web/src/types.ts` and includes:

```typescript
interface GameState {
    topics: Topic[]                   // List of topics with levels
    currentLevelId: string            // ID of the current level
    currentLevel: LevelState          // State for the open level
    chatMessages: ChatMessage[]       // Chat history from the Buddy mentor
    isTypingAnimationComplete: boolean
    auth: AuthState                   // Authentication state
    playerStats: PlayerStatsState     // Player statistics (summary + per-level)
    // Additional state for groups, user levels, etc.
}
```

For complete type definitions, see `/web/src/types.ts`.

### Actions and Reducers

Actions follow a standard pattern and are defined in `/web/src/reducers/actionTypes.ts` and
`/web/src/reducers/actionCreators.ts`. The main reducer is in `/web/src/reducers/index.ts`.

Key action categories:

- **Level Navigation**: Loading and navigating between levels
- **Game Interactions**: Handling clicks, applying fixes, showing hints
- **Authentication**: Managing user login state
- **Progress Tracking**: Tracking completed levels and statistics

## Component Hierarchy

```
App
└─ StateProvider - state management
    └─ IdeLayout - UI layout
        ├─ SidebarNavigationContainer
        ├─ TopBar - buttons
        └─ LevelViewportContainer
            ├─ CodeView
            └─ BuddyChat
```

### Key Components

- **StateProvider**: Owns global state and exposes actions through React Context
- **IdeLayout**: Provides the VS Code-like layout structure
- **SidebarNavigationContainer**: Shows topics and levels, handles navigation
- **CodeView**: Displays syntax-highlighted code with click interception
- **BuddyChat**: Shows feedback and hints from the Buddy character

All components are stored in `/web/src/components/` as TypeScript files.

## Authentication

Authentication is implemented using Firebase Authentication with Google sign-in.

### Auth State

The auth state includes:

- `isAuthenticated`: Whether a user is logged in
- `user`: User information from Firebase
- `isAdmin`: Whether the user has admin privileges

### Implementation

- Auth functionality is in `/web/src/firebase/auth.ts`
- Auth state is managed in the main reducer
- Login/logout UI is in the TopBar component

## Admin Functionality

Admin users have access to additional features:

- Viewing user activity statistics
- Accessing admin-only routes
- Seeing in-development topics even when debug mode is disabled

Admin status is determined by checking if a user's ID exists in the `admins` collection in Firestore. The check is
performed by the `isUserAdmin` function in `/web/src/firebase/firestore.ts`.

## Debug Mode

Debug mode provides additional features for development and testing:

- Showing the Reset Progress button
- Displaying topics marked as `inDevelopment: true`
- Enabling additional logging

Debug mode can be enabled by:

- Adding `?debug=true` to the URL
- Setting a flag in localStorage

Implementation is in `/web/src/utils/debugUtils.ts`.

## Routing

The application uses React Router for navigation:

- Routes are defined in `/web/src/components/App.tsx`
- Protected routes use the `AdminRoute` component
- Navigation is handled with the `useNavigate` hook

Main routes:

- `/`: Main game interface
- `/groups`: Group management
- `/join/:code`: Group join flow
- `/admin/activity`: Admin activity tracking
- `/editor`: Level editor
- `/community-levels/:levelId`: User-created levels

## Testing

The application uses Vitest with Testing Library for testing:

- **Utility Tests**: Test string manipulation and event handling utilities
- **Reducer Tests**: Test state management logic
- **Component Tests**: Test React components

Tests are located in `/web/src/tests/`.

## File Structure

- `/web/src/components/`: React components
- `/web/src/reducers/`: State management
- `/web/src/utils/`: Utility functions
- `/web/src/firebase/`: Firebase configuration and services
- `/web/src/types.ts`: TypeScript type definitions