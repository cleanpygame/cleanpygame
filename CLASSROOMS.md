## Main scenario

1. Teacher logins with a Google account to the game to get access to the GroupsPanel.
2. Teacher opens the GroupsPanel and clicks "Create a group".
3. Teacher sets a name of the group and confirms creation.
4. Teacher copies a join-link and shares it with students via email, chats, LMS, etc.
5. Student follows the join-link, goes through Google login process, and sees the invitation with the information about
   the teacher (email, name) and decides to join the group.
6. Student sets the display name and clicks a Join button. Now all the progress is visible for the teacher in a
   dashboard.
7. Student follows the join-link again to change their display name.
8. Teacher opens the GroupPage from the GroupsPanel to control the group.
9. Teacher on the GroupPage renames the group.
10. Teacher on the GroupPage regenerates the JoinLink on the Group Page to prevent usage of the old link.
11. Teacher on the GroupPage deletes the group to hide it from his groups list.
12. Teacher on the GroupPage inspects the Group Dashboard to track student progress on each individual level.

## UI Screens

### GroupsPanel

Purpose: List of all teacher-created groups, each shown as a card.

Vertical list view with groups. Most recent at the top.

Group Item Contents:

- Group name (clickable — opens Group Page)
- Number of students joined

Top bar:

- "Create Group" button

### GroupPage

Purpose: Manage group metadata and invite access.

- Group name (editable inline)
- Join Link: read-only text field with copy button
- Regenerate Join Link button
- Link to open Group Dashboard on a new page.
- Delete Group Button
- Back to the GroupsPanel button

### GroupDashboardTable

Purpose: Show the progress of students across levels.

Table View Mode selector (see below).

Table:

- Rows:
  - Row per students
  - Total row:
    - Avg completed levels among all students
    - Per level: number of students who solved this level.
- Columns:
  - LevelsCompleted
  - One column per level (numbered {topic_number}.{level_number}) with full names in the column hint.
- Value in cells: one of the values, depending on the selected mode:
  - Total misclicks count.
  - Total time spent on level
  - Number of times level was completed.
- Cell color: green, for solved levels. Dark green for level solved twice or more. Neutral for not solved levels.

Buttons:

- export full table to CSV (cell value: 1 for solved, 0 for not solved)
- export only student names and total solved levels.

### GroupJoinPage

URL: Accessed via shared join link.

First runs Google Login, then displays content:

- Group name
- Teacher name and email (read-only)
- Input field: “Your display name” prefilled from Google Account
- “Join” button

# Database

## Database Structure

```
users
  {uid}
    displayName            string
    email                  string
```

```
groups
  {groupId}
    name             string
    teacherUid       string
    joinCode         string
    members          array<string>
    createdAt        timestamp
    updatedAt        timestamp
    deleted          boolean
    deletedAt        timestamp?
    
  students                 (sub-collection)
    {studentUid}
      displayName          string
      joinedAt             timestamp
      totals:              map                  // kept in sync by cloud function
        solvedLevels       number
        totalTimeMs        number
      levels:              map<levelId,map>     // one entry per level
        <levelId>:
          misclicks        number
          hints            number
          timeMs           number
          completions      number
          lastCompletedAt  timestamp
```

```
joinCodes
  {code}
    groupId          string
    createdAt        timestamp
    active           boolean
    deleted          boolean        // mirrors group.deleted
```

## Queries:

### Teacher
```
createGroup(name)                    → groups.add({...})
listTeacherGroups()                  → groups.where('teacherUid','==',uid').where('deleted','!=',true).orderBy('createdAt','desc')
renameGroup(id,newName)              → groups.doc(id).update({name:newName,updatedAt:now})
regenerateJoinLink(id)               → cloudFnRegenerateJoinLink(id)        // keeps code unique
deleteGroup(id)                      → groups.doc(groupId).update({deleted: true, deletedAt: now})
openDashboard(id)                    → groups.doc(id).collection('students').get()
```

### Student

```
resolveJoinLink(code)                → joinCodes.doc(code).get()
joinGroup(id,displayName)            → groups.doc(id).collection('students').doc(uid).set({displayName,joinedAt:now})
updateDisplayName(id,newName)        → same path, update
writeLevelResult(id,levelId,delta)   → db.doc(`groups/${groupId}/students/${uid}`).update({ ... FieldValue.increment ... updatedAt: now })
```

## Cloud functions

```
cloudFnRegenerateJoinLink(groupId)
- create unique code in joinCodes
- update groups/{groupId}.joinCode
