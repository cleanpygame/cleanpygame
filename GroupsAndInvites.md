# Clean Python Game: Classroom Management Design Document

## Overview

This document outlines the design for implementing classroom management functionality in the Clean Python Game. The
system will support group-based classroom management with invite links, allowing teachers to track student progress.

## Core Design Principles

1. **Group Summary Optimization**: Groups store lightweight summary statistics for quick dashboard loading
2. **Teacher Authority**: Teachers have full control over their groups
3. **Privacy by Design**: Teachers see summaries of their group members
4. **Scalable Architecture**: Design supports future features like real-time updates and advanced analytics

## Main scenario

1. Teacher logins with a Google account to the game to get access to the Groups.
2. Teacher opens the GroupsPanel and clicks "Create a group".
3. Teacher sets a name of the group and confirms creation.
4. Teacher copies a join-link and shares it with students via email, chats, LMS, etc.
5. Student follows the join-link, goes through Google login process, and sees the invitation with the information about
   the teacher (email, name) and decides to join the group.
6. Student sets the display name (or accept his default name from Google Account) and clicks a Join button. Now all the
   progress is visible for the teacher in a dashboard, including progress done before joining the group.
7. Student follows the join-link again to change their display name.
8. Teacher opens the GroupPage from the GroupsPanel to control the group.
9. Teacher on the GroupPage renames the group.
10. Teacher on the GroupPage controls created join links - disable, enable, create new.
11. Teacher on the GroupPage deletes the group to hide it from his groups list.
12. Teacher on the GroupPage inspects the Group Dashboard to track student progress on each individual level.

## Data Organization and Storage

### 1. Groups Collection (`groups`)

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

playerStats/{playerId}
├── memberOfgroups: string[] // group ids where this player is a member
├── teacherIds: string[] // uids of the owners of the groups where this player is a member (for access control — grant read access for this uids)
 
...
```


**Key Design Decisions**:

- **Teacher Exclusion**: `memberIds` contains only students, not the teacher
- **Denormalized Summaries**: Store summary stats in group for quick dashboard loading
- **Soft Deletion**: Groups are marked as deleted, not physically removed
- **Join Code Simplicity**: Human-readable 8-character codes

### 2. Join Codes Collection (`joinCodes`)

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

- Players can access their stats.
- Group owners can read all stats of their group members (using PlayerStats.teacherIds)
- Group members can NOT read stats of other group members.
- Unauthenticated users can read basic group info for join flows

### Access Patterns

**Groups**:

- Read: Teachers (full access), Members (name, and owner only)
- Create: Any authenticated user (as teacher)
- Update/Delete: Group owner only. Regenerate join codes, group name, etc.
- Join Operations: Students can add themselves to memberIds

**Join Codes**:

- Read: Anyone (required for join links)
- Create: Authenticated users only
- Update/Delete: Group owner only

## React State Management

### State Architecture

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

### Data Flow Examples

**Group Dashboard Loading**:

1. Load teacher's groups from Firebase
2. Group summaries are already denormalized in group documents
3. Display dashboard immediately with cached data
4. Background refresh for real-time updates

## Detailed Technical Scenarios

### Scenario 1: Teacher Creates a Group

**Process Flow**:

1. Generate unique join code
2. Create a group document with a teacher as owner
3. Create a corresponding join code document
4. Update a teacher's local state with a new group as a selected group
5. Navigate to the group management page

**Error Handling**:

- Join code collision → Regenerate and retry
- Network failure → Show error message

### Scenario 2: Student Joins Group via Link

**User Scenario**:

1. Unauthenticated user clicks the join link
2. Display JoinGroup page with group info (name, teacher) without requiring auth
3. Prompt for Google sign-in
4. After auth, check if already a member
5. Confirm Joining the group, prompt moving to playing game

**Technical details of Join Process**:

1. Add student UID to group's `memberIds`
2. Create/update player's group membership
3. Sync existing progress to group summaries
4. Initialize student's group-specific tracking
5. Redirect to game with group context

### Scenario 3: Teacher Views Group Dashboard

**Data Loading**:

1. Load all groups where the user is owner
2. Display groups list with summaries: group name, number of members, creation date
3. Enable drill-down to individual group details: table of members with summary stats
4. On the Group page shows a table of students with summary stats. Enable to force copying player summary stats to the
   group (to restore consistency in case)
5. Enable drill-down to individual student details: with summary stats and per level stats
6. Enable to restore consistency by recalculating summary using full per-level stats. Update summary duplicated in
   groups

## UI/UX Guidelines

### Page Designs

#### 0. Top Bar in IDE Layout

- add a link to the Groups page.

#### 1. Groups page

- **Header**: Back to Game navigation, create group button
- **Main Content**: Grid of groups you own, each showing name, members count, creation date. Groups are clickable.
- **Small secondary content**: List of groups you have joined: group name, group owner name, joinDateAndTime.
- Do not stretch the content to a full-screen width on the big screens.

#### 2. Group page

- **Header**: Group Name.
- **Sidebar to the left**: Creation time, invite links with copy, de/activate, create buttons.
- **Table to the right with members with summary stats** Clickable rows — open Student Profile
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

#### 3. Group Join Flow

- **Landing Page**: Special minimalistic page, explaining what is going on with teacher name and group name.
- GroupJoinPage
    - Group name
    - Teacher name (read-only)
    - Not authenticated user:
        - "Sign-In via Google" button / Or Join Button if
    - Authenticated user (or after sign-in):
        - Input field: "Your display name" prefilled from Google Account
        - Join button
- **Confirmation**: Success message with button "Start Playing"
- **Error Handling**: Clear error messages with recovery options

### Router Behavior


**Route Structure**:

Opening the page should change the url in the browser but do not reload the page.

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
- Prevent page reloading on navigation

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