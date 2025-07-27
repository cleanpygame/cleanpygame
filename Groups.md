# Clean Python Game: Player Statistics and Classroom Management Design Document

## Overview

This document outlines the design for implementing comprehensive player statistics tracking and classroom management
functionality in the Clean Python Game. The system will support individual player progress tracking, group-based
classroom management, and detailed analytics for both students and teachers.

## Core Design Principles

1. **Player-Centric Statistics**: All detailed statistics are stored per player globally, not per group
2. **Group Summary Optimization**: Groups store lightweight summary statistics for quick dashboard loading
3. **Offline-First Approach**: Local statistics are maintained and synced to Firebase when available
4. **Privacy by Design**: Students can only see their own detailed stats; teachers see summaries of their group members
5. **Scalable Architecture**: Design supports future features like real-time updates and advanced analytics

## Main scenario

1. Teacher logins with a Google account to the game to get access to the Groups.
2. Teacher opens the GroupsPanel and clicks "Create a group".
3. Teacher sets a name of the group and confirms creation.
4. Teacher copies a join-link and shares it with students via email, chats, LMS, etc.
5. Student follows the join-link, goes through Google login process, and sees the invitation with the information about
   the teacher (email, name) and decides to join the group.
6. Student sets the display name (or accept his default name from Google Account) and clicks a Join button. Now all the
   progress is visible for the teacher in a
   dashboard, including progress done before joining the group.
7. Student follows the join-link again to change their display name.
8. Teacher opens the GroupPage from the GroupsPanel to control the group.
9. Teacher on the GroupPage renames the group.
10. Teacher on the GroupPage controls created join links - disable, enable, create new.
11. Teacher on the GroupPage deletes the group to hide it from his groups list.
12. Teacher on the GroupPage inspects the Group Dashboard to track student progress on each individual level.

## Data Organization and Storage

### 1. Player Statistics Collection (`playerStats`)

**Document ID**: User UID
**Purpose**: Store comprehensive, global statistics for each player

```
playerStats/{playerId}
├── playerId: string
├── displayName: string
├── email?: string
├── summary: PlayerSummaryStats
├── levels: { [levelKey]: PlayerLevelStats }
├── groups: { [groupId]: PlayerGroupMembership }
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

**Key Design Decisions**:

- **Global Statistics**: Player stats exist independently of group membership
- **Level Key Format**: Use `topic__levelId` format to avoid Firestore nested object limitations
- **Aggregated Summaries**: Pre-calculated totals for quick access
- **Group Membership Tracking**: Player knows which groups they belong to

### 2. Groups Collection (`groups`)

**Document ID**: Auto-generated
**Purpose**: Manage classroom groups with lightweight member summaries

```
groups/{groupId}
├── id: string
├── name: string
├── ownerUid: string (teacher)
├── ownerName: string
├── ownerEmail?: string
├── joinCode: string
├── memberIds: string[] (student UIDs only)
├── memberSummaries: { [playerId]: GroupMemberSummary }
├── createdAt: Timestamp
├── updatedAt: Timestamp
├── deleted: boolean
└── deletedAt?: Timestamp
```

**Key Design Decisions**:

- **Teacher Exclusion**: `memberIds` contains only students, not the teacher
- **Denormalized Summaries**: Store summary stats in group for quick dashboard loading
- **Soft Deletion**: Groups are marked as deleted, not physically removed
- **Join Code Simplicity**: Human-readable 8-character codes

### 3. Join Codes Collection (`joinCodes`)

**Document ID**: Join code string
**Purpose**: Map join codes to group IDs for quick lookups

```
joinCodes/{code}
├── groupId: string
├── ownerUid: string (owner of the group)
├── createdAt: Timestamp
├── active: boolean
└── deleted: boolean
```

## Firebase Security Rules Organization

### Rule Philosophy

- **Principle of Least Privilege**: Users can only access data they need
- **Teacher Authority**: Teachers have full control over their groups
- **Student Privacy**: Students can only see their own detailed statistics
- **Join Link Accessibility**: Unauthenticated users can read basic group info for join flows

### Access Patterns

**Player Statistics**:

- Read/Write: Own statistics only
- Exception: Teachers can read all stats of their group members

**Groups**:

- Read: Teachers (full access), Members (basic info)
- Create: Any authenticated user (as teacher)
- Update/Delete: Group owner only. Regenerate join codes, group name, etc.
- Join Operations: Students can add themselves to memberIds

**Join Codes**:

- Read: Anyone (required for join links)
- Create: Authenticated users only
- Update/Delete: Group owner only

## React State Management

### State Architecture

**Global State Structure**:

```
GameState
├── game: GameData (levels, progress, etc.)
├── auth: AuthState
├── classroom: ClassroomState
├── playerStats: PlayerStatsState
└── ui: UIState
```

**Classroom State**:

```
ClassroomState
├── ownedGroups: Group[]
├── joinedGroups: Group[]
├── selectedGroup?: Group
├── selectedMember?: GroupMemberSummary
├── isLoading: boolean
└── error?: string
```

### State Management Patterns

1. **Async Actions (Thunks)**: Handle all Firebase operations
2. **Optimistic Updates**: Update UI immediately, rollback on error
3. **Cache Management**: Store frequently accessed data locally
4. **Sync Strategies**: Periodic sync of local stats to Firebase

### Data Flow Examples

**Level Completion Flow**:

1. Player completes level → Update local game state
2. Update local player statistics
3. If online → Sync to Firebase playerStats
4. Update group member summary for all joined groups.
5. Trigger UI updates via state changes

**Group Dashboard Loading**:

1. Load teacher's groups from Firebase
2. Group summaries are already denormalized in group documents
3. Display dashboard immediately with cached data
4. Background refresh for real-time updates

## Detailed Technical Scenarios

### Scenario 1: Player Completes a Level

**Local Updates**:

1. Update `GameState.solvedLevels`
2. Update local player per-level stats (time, hints, misclicks) and summary stats
3. Trigger UI animations and feedback

**Firebase Sync** (if authenticated and online):

1. Update `playerStats/{playerId}/levels/{levelKey}`
2. Update summary statistics
3. If player is in groups, update group member summaries
4. Handle sync failures gracefully with retry logic

### Scenario 2: Teacher Creates a Group

**Process Flow**:

1. Generate unique join code
2. Create group document with teacher as owner
3. Create corresponding join code document
4. Update teacher's local state with new group as selected group
5. Navigate to group management page

**Error Handling**:

- Join code collision → Regenerate and retry
- Network failure → Show error message

### Scenario 3: Student Joins Group via Link

**Authentication Flow**:

1. Unauthenticated user clicks join link
2. Display group info (name, teacher) without requiring auth
3. Prompt for Google sign-in
4. After auth, check if already a member

**Join Process**:

1. Add student UID to group's `memberIds`
2. Create/update player's group membership
3. Sync existing progress to group summaries
4. Initialize student's group-specific tracking
5. Redirect to game with group context

### Scenario 4: Teacher Views Group Dashboard

**Data Loading**:

1. Load all groups where user is owner
2. Display groups list with summaries: group name, number of members, creation date/
3. Enable drill-down to individual group details: table of members with summary stats.
4. On the Group page show table of students with summary stats. Enable to force copying player summary stats to the
   group (to restore consistency in case)
5. Enable drill-down to individual student details: with summary stats and per level stats.
6. Enable to restore consistency by recalculating summary using full per-level stats. Update summary duplicated in
   groups.

## UI/UX Guidelines

### Design System

### Page Designs

#### 1. Game Interface

- Top panel contains links to Groups and Statistics

#### 2. Groups page

- **Header**: Back to Game navigation, create group button
- **Main Content**: Grid of groups you own, each showing name, members count, creation date. Groups are clickable.
- **Small secondary content**: List of groups you have joined: group name, group owner name, joinDateAndTime.

### 3. Group page

- **Header**: Group Name.
- **Sidebar**: Group management tools (invite links, with creation date and ability to de/activate them. Creation of the
  new invite link)
- **Table with members with summary stats** Clickable rows — open Student Profile
    - Rows:
        - Row per students
        - Total row:
            - Avg completed levels among all students
            - Per level: number of students who solved this level.
    - Columns:
        - Levels Completed
        - Total Levels Played - including repetitions
        - Total misclicks
        - Total time spent
        - Total hints used
        - Total wrong clicks
        - Last played at
        - Joined at

#### 4. Student Profile

- **Overview**: Personal statistics summary
- **Level Progress**: Grid showing completion status per level

#### 5. Group Join Flow

- **Landing Page**: Group info with teacher details
- GroupJoinPage
    - Group name
    - Teacher name (read-only)
    - Not authenticated user:
        - "Sign-In via Google" button / Or Join Button if
    - Authenticated user (or after sign-in):
        - Input field: “Your display name” prefilled from Google Account
        - Join button
- **Confirmation**: Success message with button "Start Playing"
- **Error Handling**: Clear error messages with recovery options

### Router Behavior

**Route Structure**:

```
/                           # Game interface
/stats                      # Student statistics
/groups                     # Teacher dashboard
/groups/:id                 # Specific group management
/join/:code                 # Group join flow
/join/:code/success         # Join confirmation
```

**Navigation Patterns**:

- **Context Preservation**: Maintain game state across navigation
- **Deep Linking**: Support direct links to specific groups/levels
- **Back Button Handling**: Proper history management for join flows
- **Authentication Guards**: Redirect to sign-in when required
- Prevent pare reloading on navigation.
-

### Responsive Design

**Breakpoints**:

- Mobile: < 768px (single column, simplified UI)
- Tablet: 768px - 1024px (adaptive layout)
- Desktop: > 1024px (full feature set)

**Mobile Considerations**:

- Touch-friendly buttons and controls
- Simplified navigation patterns
- Optimized loading for slower connections
- Offline-first approach for core game functionality

## Performance Considerations

### Data Loading Strategies

1. **Lazy Loading**: Load detailed stats only when requested
2. **Pagination**: No pagination required: classes are small!

### Firebase Optimization

1. **Composite Indexes**: Optimize common query patterns
2. **Batch Operations**: Group related writes together
3. **Connection Pooling**: Reuse Firebase connections
4. **Offline Persistence**: Enable Firestore offline support
