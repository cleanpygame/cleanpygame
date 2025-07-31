# Clean-Code Game Contribution Guide

## Project Overview

The Clean-Code Game is an interactive, educational web game designed to teach players clean code principles through
hands-on practice. It targets beginner developers, particularly first-year computer science students, helping them
recognize code smells and learn refactoring techniques.

## Setting Up the Project

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Git

### Clone the Repository

```bash
git clone https://github.com/your-org/cleanpygame.git
cd cleanpygame
```

### Project Structure

The project consists of two main components:

1. **Web Application** (`/web`): The frontend application that players interact with
2. **Levels Compiler** (`/levels_compiler`): A tool that processes level definitions from a custom format into JSON

### Installing Dependencies

For the web application:

```bash
cd web
npm install
```

For the levels compiler:

```bash
cd levels_compiler
npm install
```

## Running the Application

### Development Server

To start the development server:

```bash
cd web
npm run dev
```

This will start a Vite development server with hot module replacement at `http://localhost:5173`.

### Generating Level Data

After making changes to level files in the `/web/levels` directory:

```bash
cd web
npm run gen
```

This runs the levels compiler to generate the updated `levels.json` file.

### Building for Production

```bash
cd web
npm run build
```

This runs the levels compiler, compiles TypeScript, and builds the application with Vite.

## Technologies Used

### Web Application

- **Framework**: React 19.0.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.1.4
- **Build Tool**: Vite 6.3.1
- **Syntax Highlighting**: prism-react-renderer 2.4.1
- **Backend Services**: Firebase 10.8.0

### Levels Compiler

- **Language**: TypeScript
- **Build Tool**: TypeScript compiler

## Key Architectural Components

### Frontend Architecture

The frontend is built as a single-page web application (SPA) with the following components:

- **State Management**: React Context API and reducers
- **Routing**: React Router
- **Code Display**: Custom code viewer with syntax highlighting
- **Game Logic**: Event-based system for level progression

For detailed information about the frontend architecture, component hierarchy, and state management, see
the [Architecture Design Document](DesignDocs/02-CoreArchitecture.md).

### Firebase Integration

The project uses Firebase as its backend-as-a-service solution to support classroom functionality.

#### Firebase Services Used

- **Firebase Authentication** - Google OAuth for user sign-in
- **Cloud Firestore** - NoSQL database for storing groups, join codes, and user data
- **Firebase Hosting** - For deploying the web application

#### Firebase Project Details

- **Project ID**: `cleanpygame`
- **Auth Domain**: `cleanpygame.firebaseapp.com`
- **Database**: Cloud Firestore in production mode

#### Configuration File

The Firebase configuration is located in `web/src/firebase/index.ts`:

```typescript
const firebaseConfig = {
    apiKey: "AIzaSyA3slyeaQPyZoslSEa8tVYaa2dxZREOjeI",
    authDomain: "cleanpygame.firebaseapp.com",
    projectId: "cleanpygame",
    storageBucket: "cleanpygame.firebasestorage.app",
    messagingSenderId: "112429030567",
    appId: "1:112429030567:web:18798b8af61858ab7d8f82",
    measurementId: "G-JCN6ZHYVPR"
};
```

## Testing

The project uses Vitest with Testing Library for testing.

### Running Tests

```bash
cd web
npm test
```

### Test Structure

- **Utility Tests**: Test string manipulation and event handling utilities
- **Reducer Tests**: Test state management logic
- **Component Tests**: Test React components

### Writing Tests

- Place test files in `/web/src/tests`
- Use `.test.ts` or `.test.jsx` file extensions
- Follow the existing patterns for utility, reducer, and component tests

## Deployment

The project is deployed to Firebase.

### Deployment Commands

- Full deployment (hosting + Firestore):
  ```bash
  cd web
  npm run deploy
  ```

- Deploy only hosting:
  ```bash
  cd web
  npm run deploy:hosting
  ```

- Deploy only Firestore rules and indexes:
  ```bash
  cd web
  npm run deploy:firestore
  ```

## Coding Conventions

### TypeScript

- Use TypeScript for all new code
- Define interfaces for all data structures
- Use type annotations for function parameters and return types
- Avoid using `any` type when possible

### React Components

- Use functional components with hooks
- Keep components small and focused on a single responsibility
- Use props destructuring
- Use the React Context API for state that needs to be shared across components

### CSS/Styling

- Use Tailwind CSS utility classes for styling
- Avoid inline styles
- Use consistent naming conventions for custom CSS classes

### File Organization

- Place components in `/web/src/components`
- Place utilities in `/web/src/utils`
- Place tests in `/web/src/tests`
- Place Firebase-related code in `/web/src/firebase`

## Development Tips

1. **Level Development**:
    - Understand the PyLevels format before creating or modifying levels
    - Test levels thoroughly to ensure they can be solved
    - Use the `npm run gen` command to generate the updated `levels.json` file

2. **State Management**:
    - Follow the reducer pattern for state management
    - Keep components pure when possible, using containers for context access
    - Use the React DevTools extension to debug state changes

3. **Performance Optimization**:
    - Use React.memo for components that render frequently
    - Avoid unnecessary re-renders by using useMemo and useCallback
    - Use the React Profiler to identify performance bottlenecks

4. **Firebase Best Practices**:
    - Keep security rules up to date
    - Use batched writes for related operations
    - Minimize the number of reads and writes to reduce costs

## Design Documents

For more detailed information about the system design, refer to the design documents in the [DesignDocs](./DesignDocs)
directory:

- [Architecture](DesignDocs/02-CoreArchitecture.md): Frontend architecture and component hierarchy
- [Levels Format](DesignDocs/01-LevelsFormat.md): Format for defining levels
- [Admin Activity Tracking](DesignDocs/06-PlayerProgressAdminDashboard.md): Admin features for tracking user activity
- [Community Levels](DesignDocs/05-CommunityLevels.md): User-created levels functionality
- [Groups and Invites](DesignDocs/04-GroupsAndInvites.md): Classroom management functionality
- [Player Progress](DesignDocs/03-PlayerProgress.md): Player statistics tracking