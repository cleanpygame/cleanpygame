# Clean-Code Game — Project Specification

## 1. Project Overview

**Purpose**  
The Clean-Code Game is an interactive, educational web game designed to teach players clean code principles through hands-on practice. It aims to help developers:

- Learn to recognize common code smells and poor coding patterns  
- Train their ability to analyze and identify problematic code on sight  
- Become familiar with practical refactoring techniques to improve code readability, structure, and maintainability

**Target Audience**  
The game is designed for beginner developers, particularly first-year computer science students. It serves as a companion tool during their initial exposure to real-world programming standards. The game reinforces theoretical programming education by introducing them to common pitfalls and best practices early in their learning journey.

**Primary Language**  
All code examples and exercises use Python, which is widely taught in academic settings and offers clear syntax that
aligns well with teaching clean code principles.

**Educational Focus**  
The game's content is primarily based on:

- **Uncle Bob's Clean Code** philosophy — focusing on clarity, simplicity, and maintainability
- Selected elements of **PEP8** — relevant style issues may be highlighted, but not as a primary focus  
- Basic **SOLID principles** — introduced in later stages, once foundational skills are developed

**Usage Mode**  
The game is designed for **solo self-paced learning**, but includes support for use in **classroom environments**:
Instructors can generate **shareable join-links** to track students progress.

## 2. Gameplay Mechanics

**Core Gameplay Loop**

Player is guided by a Buddy — a mentor character that provides hints, feedback, and encouragement throughout the game.

Each level presents a short Python code snippet containing several **code smells** or **anti-patterns**. The player's
objective is to visually inspect and **click** on the problematic code elements. Each interaction results in **immediate
feedback**:

- ✅ **Correct Click** — Triggers a bad code replacement with the good one and a **Buddy chat message** explaining the issue.
- ❌ **Incorrect Click** — Triggers a small animation feedback and a **Buddy message**: "Nope, not an issue."

The level is complete once **all confirmed issues** are correctly identified and fixed.

**Support & Constraints**

- 🆘 **Ask for Help Button**
  - Triggers a **Buddy hint message** about the first remaining issue.
  - Button is always visible during the level.

**Level Progression**

- 📘 **Topics & Folders** — Game is divided into topical folders. Players may start any topic.
- ➡️ **Linear Flow Within Topics** — Levels must be completed in sequence.
- 🔁 **Replayability** — Players may revisit completed levels.

The entire experience remains **minimal and distraction-free**, emphasizing understanding and reflection over gamified rewards.

## 3. UI/UX Design

**Overall Style & Theme**

The interface mimics the layout and color scheme of **Visual Studio Code**, offering a familiar environment for students and aspiring developers. This includes:

- A clean **dark theme** inspired by VS Code defaults  
- Monospaced fonts and **Python syntax highlighting** in all code views  
- Minimalist design, focused on clarity and readability  
- No gamified or decorative elements — the UI supports learning, not entertainment

**Layout**

The main game interface is divided into two key areas:

- 📁 **Left Sidebar – Folder & Level Navigation**  
  - Displays a **directory tree**, similar to the file explorer in VS Code  
  - Folders represent **topics** (e.g., "Naming", "Duplication")
  - Each level is displayed as a **Python source file** (e.g., `onboarding.py`, `understandable.py`)  
  - Completed levels may be marked visually; the current level is highlighted

- 🖥️ **Main Editor Area – Code Display & Interaction**  
  - Displays a **code snippet with Python syntax highlighting**  
  - Players **click directly** on code elements to identify problems  
  - All interactions occur inline or via overlays within this editor area

- 💬 **Buddy Chat Area**
  - Always visible in the **bottom right corner**
  - Displays feedback for clicks, hints, and level completion
  - New messages appear in the bottom. Old messages move up and are available with the scrolling up.

**Interaction Feedback Flow**

- Clicking on code:
  - Triggers small animation
  - Feedback appears as a **message from Buddy** in the persistent chat

**Ask for Help Button**

- Available at all times during the level
- Triggers a Buddy message with a relevant hint

**Animations & Visual Feedback**

- ✅ Small animation on correct or incorrect clicks (e.g., a quick visual pulse or flash)
- 🔄 Code appears with a typing animation when loading new levels
- 🔇 No sound effects — the game is silent

**Interactivity Cues**

No visual clues needed. The mouse cursor remains **hand pointer** over the whole code preventing hover-hunt!

## UX Requirements and decisions:

1. After clicking, the player clearly sees what and how something has changed.
2. For non-obvious changes, an explanation appears that draws attention.
3. At the beginning of the level, the player notices Buddy's starting comments.
4. After fixing the last error, it's obvious to the player that the level is complete.

## 4. Technical Architecture

### Frontend Architecture

The game is built as a **single-page web application (SPA)**, using lightweight, modern tools focused on readability and interaction rather than code editing.

**Tech Stack Summary**

| Part                | Tech                   | Purpose                                               |
|---------------------|------------------------|-------------------------------------------------------|
| Framework           | React                  | UI rendering, component model, state management       |
| Syntax Highlighting | prism-react-renderer   | Lightweight, read-only syntax highlighting for Python |
| Styling             | Tailwind CSS           | Utility-first styling, matches VS Code feel           |
| Interactions        | Custom logic via React | Tooltips, overlays, game state, event triggers        |

> **Rationale:**  
> Heavy editors like Monaco are avoided. prism-react-renderer provides the necessary highlighting with full control over rendering, performance, and custom overlays.

### Application Structure

**Client-Side Architecture with Firebase Backend**

The game is primarily **client-side** with Firebase backend services:

- Levels are compiled from PyLevels format to JSON
- Game logic, event handling, and UI state are managed by React reducers
- Firebase provides authentication, database, and hosting services

For detailed information about the frontend architecture, component hierarchy, and state management, see
the [Architecture Design Document](DesignDocs/02-CoreArchitecture.md).

### Hosting & Deployment

**Build Tools:**
- Vite (for faster builds)
- TypeScript compiler for levels_compiler

### Backend with Firebase

Firebase is used to store progress, support classroom use cases and community levels with no backend maintenance.

#### Key Features

- **Firebase Hosting** of client web app
- **Authentication** — Google sign-in for users
- **Firestore** — Stores player progress, group memberships, and community levels
- **Security Rules** — Ensures users can only read/write their own data

#### Classroom Integration
- Teachers create groups and generate shareable join links like `/join/{code}`
- Students join groups via these links and their progress is tracked
- Teachers can view detailed progress statistics for their group members

For detailed information about the classroom management functionality, see
the [Groups and Invites Design Document](DesignDocs/04-GroupsAndInvites.md).

#### Community Levels
- Users can create and share their own levels using the in-browser editor
- Levels are stored in Firebase and can be shared via unique URLs
- Shared levels appear under "My Levels" for users who access them

For detailed information about the community levels functionality, see
the [Community Levels Design Document](DesignDocs/05-CommunityLevels.md).

## 5. Level Format and Content

The game uses a custom format called PyLevels to define the levels. This format allows for:

- Defining code snippets with problematic elements
- Specifying replacements for those elements
- Adding explanations and hints for each issue
- Defining chat messages from the Buddy character

For detailed information about the level format, see the [Levels Format Design Document](DesignDocs/01-LevelsFormat.md).

## 6. Player Progress Tracking

The game tracks player progress to provide:

- Individual statistics for each player
- Detailed analytics for teachers
- Aggregated summaries for quick access

For detailed information about the player progress tracking functionality, see
the [Player Progress Design Document](DesignDocs/03-PlayerProgress.md).

## 7. Admin Features

The game includes admin features for:

- Viewing recent activity from users
- Monitoring usage statistics
- Managing the system

For detailed information about the admin features, see
the [Admin Activity Tracking Design Document](DesignDocs/06-PlayerProgressAdminDashboard.md).

## 8. Documentation

The project includes comprehensive documentation to help developers understand and contribute to the codebase:

- [Contribution Guide](./ContributionGuide.md): Instructions for setting up the project, running the application, and
  contributing to the codebase
- [Design Documents](./DesignDocs): Detailed design documents for various aspects of the system
