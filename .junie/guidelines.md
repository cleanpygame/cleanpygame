# Clean-Code Game Project Guidelines

## Project Overview

The Clean-Code Game is an interactive, educational web game designed to teach players clean code principles through
hands-on practice. It targets beginner developers, particularly first-year computer science students, helping them
recognize code smells and learn refactoring techniques.

The game presents Python code snippets containing code smells or anti-patterns. Players identify issues by clicking on
problematic code elements, receiving immediate feedback from a "Buddy" character. The game is organized into topics (
e.g., "Naming", "Decomposition") with multiple levels in each topic.

## Project Structure

The project consists of two main components:

### 1. Web Application (`/web`)

The frontend application that players interact with, built with React and TypeScript.

Key directories and files:

- `/web/src/components`: React components
- `/web/src/reducers`: State management
- `/web/src/tests`: Test files
- `/web/src/utils`: Utility functions
- `/web/src/firebase`: Firebase configuration
- `/web/ARCHITECTURE.md`: Detailed frontend architecture documentation

### 2. Levels Compiler (`/levels_compiler`)

A TypeScript tool that processes level definitions from a custom format into JSON for the web application.

Key files:

- `/levels_compiler/main.ts`: Entry point
- `/levels_compiler/parser.ts`: Parser for the PyLevels format

### 3. Documentation

- `/SPECIFICATION.md`: Project requirements and specifications
- `/LEVELS_FORMAT.md`: Documentation for the level format
- `/web/ARCHITECTURE.md`: Frontend architecture details

### 4. Game Content

- `/web/levels`: Source level files in PyLevels format
- Generated `levels.json`: Compiled level data used by the web application

## Technology Stack

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

## Development Workflow

### Setting Up the Project

1. Clone the repository
2. Install dependencies:
   ```
   cd web
   npm install
   cd ../levels_compiler
   npm install
   ```

### Running the Development Server

```
cd web
npm run dev
```

This starts a Vite development server with hot module replacement.

### Generating Level Data

After making changes to level files in the `/web/levels` directory:

```
cd web
npm run gen
```

This runs the levels compiler to generate the updated `levels.json` file.

### Building for Production

```
cd web
npm run build
```

This runs the levels compiler, compiles TypeScript, and builds the application with Vite.

## Testing

The project uses Vitest with Testing Library for testing.

### Running Tests

```
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
  ```
  cd web
  npm run deploy
  ```

- Deploy only hosting:
  ```
  cd web
  npm run deploy:hosting
  ```

- Deploy only Firestore rules and indexes:
  ```
  cd web
  npm run deploy:firestore
  ```

## Code Style Guidelines

### General

- Follow TypeScript best practices
- Use functional components with hooks for React
- Use Tailwind CSS for styling

### Component Structure

- Place components in `/web/src/components`
- Use JSX for React components
- Follow the component hierarchy described in `/web/ARCHITECTURE.md`

### State Management

- Follow the state shape and actions defined in `/web/ARCHITECTURE.md`
- Use the reducer pattern for state management
- Keep components pure when possible, using containers for context access

### Testing

- Write tests for all new functionality
- Ensure reducer tests verify that levels can be solved
- Test components using Testing Library's best practices

## Contributing to the Project

1. Understand the game mechanics and educational focus from `/SPECIFICATION.md`
2. Review the level format in `/LEVELS_FORMAT.md` before creating or modifying levels
3. Follow the architecture guidelines in `/web/ARCHITECTURE.md` when modifying the frontend
4. Run tests to ensure your changes don't break existing functionality
5. Generate updated level data if you've modified level files