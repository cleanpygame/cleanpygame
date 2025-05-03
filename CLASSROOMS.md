### Scenario 1 — Create Classroom Group

- **Trigger**: Teacher selects **“New Group”** in the classroom panel.
- **Steps**
    1. Enter a group name (e.g. “Spring 2025 CS101”).
    2. Confirm.
- **Outcome**
    - Backend creates a unique `groupId` and `joinlink`
    - Group appears in the teacher’s list with a ready-made join link.

### Scenario 2 — Delete Classroom Group

- **Trigger**: Teacher clicks **“Delete”** on a group card.
- **Steps**
    1. System shows warning with student count & last-activity date.
    2. Press **“Delete”**.
- **Outcome**
    - Group record and all progress documents under that `groupId` are removed from Firestore.

### Scenario 3 — Share Join Link

- **Trigger**: Teacher presses **“Copy Link”** next to a group.
- **Steps**
    1. Link of the form `https://game.dev/?group=abc123` is copied to clipboard.
    2. Teacher sends it to students (mail, chat, LMS, QR on projector, etc.).
- **Outcome**
    - Any student opening the link joins anonymously; their progress is tagged with the group’s `groupId` and surfaces
      on the teacher dashboard.

### Scenario 4 — Regenerate Join Link

- **Trigger**: Teacher presses **“Regenerate Link”** next to a group.
- **Steps**
    1. System shows warning.
    2. Press "Regenerate".
- **Outcome**
    - Old link stops working. New starts working.

### Scenario 5 — Teacher Dashboard

- **Trigger**: Teacher opens a dashboard for a group.
- **Progress grid** — list of students (anon IDs or names if signed-in) with level completion info.
- Switch between modes: Misclicks, Time, Revisits.
- Depending on the mode, cell contains: total number of misclicks, total time, or total number of completions of the
  level.
- **Outcome**
    - Real-time snapshot pulled from Firestore; No auto-refresh needed.
    - No personal data beyond the chosen display name; satisfies classroom privacy.

### Scenario 5 — Export Progress

- **Trigger**: Teacher clicks **“Export CSV”** in dashboard.
- **Outcome**
    - System streams a CSV (`group-abc123-2025-05-02.csv`) containing:  
      `studentId, number of completed levels`.
    - File lands in browser downloads for import into LMS or grade-sheet.

### Scenario 6 — Join Link

- **Trigger**: Student follows the join link.
- **Steps**:
    1. System shows who is inviting, and what outcomes it has.
    2. System suggests to login via Google to save progress. A student can skip this step.
    3. System suggests to specify Display Name in the format "FirstName FamilyName".
    4. Student hits "Join" button.
- **Outcome**
    - Progress is tracked under `groupId`.

### Scenario 7 — Change Display Name

- **Trigger**: Student clicks on their name (or anon ID) in UI.
- **Steps**:
    1. Enter a new display name.
    2. Confirm
- **Outcome**
    - The display name is updated in the group dashboard and in the player UI

# Firestore Specification for CLASSROOMS

## 1. `groups` Collection

Each document is a teacher-created group.

```json
/groups/{
  groupId
} => {
  "name": "Spring 2025 CS101",
  "ownerUid": "teacherUID",
  "joinLinkId": "abc123",
  "createdAt": "timestamp",
  "lastActivity": "timestamp",
  "studentCount": 17
}
```

## 2. `joinLinks` Collection

Maps public join links to internal group IDs.

```json
/joinLinks/{
  joinLinkId
} => {
  "groupId": "groupXYZ",
  "active": true,
  "createdAt": "timestamp"
}
```

## 3. `groupMemberships` Collection

Links players to classroom groups.

```json
/groupMemberships/{
  groupId
}_{
  playerId
} => {
  "groupId": "groupXYZ",
  "playerId": "anon123",
  "displayName": "Alice Bauer",
  "joinedAt": "timestamp",
  "signedIn": true
}
```

## 4. `progress` Collection

Tracks player progress on each level.

```json
/progress/{
  playerId
}_{
  levelId
} => {
  "playerId": "anon123",
  "groupId": "groupXYZ",
  "levelId": "naming/onboarding",
  "finished": true,
  "timestamp": "timestamp",
  "unlockedWisdoms": [
    "naming-descriptive"
  ],
  "misclicks": 2,
  "timeSpent": 31.4,
  "revisits": 1
}
```

## 5. `players` Collection (optional)

Player profile info.

```json
/players/{
  playerId
} => {
  "displayName": "Alice Bauer",
  "signedIn": true,
  "createdAt": "timestamp"
}
```

## 🔐 Firestore Security Rules (Outline)

- Students can write only their own data.
- Teachers can read group-linked data for their groups.
- Join links are public but scoped.

## 🔁 Scenario Mapping

| Scenario            | Collections Affected                                  | Notes                                |
|---------------------|-------------------------------------------------------|--------------------------------------|
| Create Group        | `groups`, `joinLinks`                                 | Generates `groupId` and `joinLinkId` |
| Delete Group        | `groups`, `progress`, `groupMemberships`, `joinLinks` | Full cleanup                         |
| Share Link          | `joinLinks`                                           | Uses `joinLinkId` for public URL     |
| Regenerate Link     | `joinLinks`                                           | Deactivates old, creates new         |
| Student Joins       | `groupMemberships`, `players`, `progress`             | Auto-created entries                 |
| Update Display Name | `groupMemberships`, `players`                         | Depending on auth method             |
| Teacher Dashboard   | `groupMemberships`, `progress`                        | Filtered by `groupId`                |
| Export CSV          | `progress`, `groupMemberships`                        | Queried and formatted backend-side   |

## 🌱 Recommended Indexes

- `/progress` composite: `groupId + playerId + levelId`
- `/groupMemberships` composite: `groupId + joinedAt`