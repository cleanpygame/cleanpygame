# Frontend Architecture (v2)

This document describes the updated frontend architecture for the Clean‑Code Game, incorporating all changes from Specification v1 → v2.

---

## State Shape

```ts
interface GameState {
  topics: Topic[]                   // list of all topics with levels from levels.json
  currentLevelId: LevelId
  currentLevel: LevelState          // transient state for the open level
  solvedLevels: LevelId[]
  discoveredWisdoms: string[]       // list of wisdom IDs unlocked across all levels
  notebookOpen: Boolean
  chatMessages: ChatMessage[]      // chat history from the Buddy mentor
}

interface LevelState {
  level: LevelData                  // level data (filename, blocks, ...)
  triggeredEvents: string[]         // in-level progress: all event IDs clicked
  mistakeCount: number              // number of incorrect clicks so far
  pendingHintId: string | null      // ID of the next hint to send via chat, ID is a blockId if the block with the hint
  autoHintAt: number | null         // timestamp (ms) when auto-hint should post
}

interface ChatMessage {
  id: string
  type: 'my' | 'explain' | 'hint' | 'error' | 'level_finished'
  text: string
}

// levels.json:
interface Topic {
  name: string
  wisdoms: WisdomEntry[]
  levels: LevelData[]
}

interface WisdomEntry {
  id: string
  text: string
}

interface LevelData {
  filename: string
  wisdoms: string[]
  blocks: LevelBlock[]
}
```

---

## Actions

- **POST_BUDDY_MESSAGE**  
  _payload:_ `{ message: ChatMessage }`  
  Dispatch to append a new chat entry (correct/incorrect feedback, hints, wisdoms).

- **GET_HINT**  
  * payload: none
  * dispatches `POST_BUDDY_MESSAGE({ type: 'hint', text: pendingHintBlock.hint })`
  * `autoHintAt = Date.now() + AUTOHINT_DELAY`
  * `pendingHintId = null`

- **LOAD_LEVEL**  
  * payload: `{ levelId: LevelId }`
  * sets `currentLevelId` and `currentLevel` to the level with the given ID with zero progress.
  * calculates `currentLevel.pendingHintId` (id of the first non-triggered event with an attached hint)
  * Dispatches `POST_BUDDY_MESSAGE({ type: 'info', text: level.startInstructions })`.
  * `autoHintAt = Date.now() + AUTOHINT_DELAY`

- **APPLY_FIX**  
  * payload: `{ eventId: string }`
  * Appends `triggeredBlock.eventId` to `triggeredEvents`.  
  * calculates `currentLevel.pendingHintId`
  * Dispatches `POST_BUDDY_MESSAGE({ type: 'success', text: triggeredBlock.explanation })`.
  * `autoHintAt = Date.now() + AUTOHINT_DELAY`

* **NEXT_LEVEL**
  * payload: none
  * sets `notebookState` to `closed`
  * adds `currentLevelId` to `solvedLevels`
  * adds `level.wisdoms` to `discoveredWisdoms`
  * sets `currentLevelId` to the next level in the list of topics
  * sets `currentLevel` to the level with the new ID with zero progress.
  * `autoHintAt = Date.now() + AUTOHINT_DELAY`
  * 
* **RESET_PROGRESS**
  * payload: none
  * revert state to initial value, resetting all the progress.
  * `autoHintAt = Date.now() + AUTOHINT_DELAY`

* **OPEN_NOTEBOOK**
  * payload: none
  * `notebookOpen = true`

* **CLOSE_NOTEBOOK**
  * payload: none
  * `notebookOpen = false`

---

## Components

```
App
└─ StateProvider - state management
    └─ IdeLayout - UI layout
        ├─ SidebarNavigationContainer
        ├─ TopBar - buttons
        ├─ LevelViewportContainer
        │   ├─ CodeView
        │   └─ BuddyChat
        └─ NotebookContainer
```

Containers use data from Context. Other components are pure props-driven components.

## StateProvider

Responsibility – Owns global reactive state (current topic/level, wisdoms, lock‑out timers) and exposes actions through React Context.

Public interface – No props; wraps the rest containers.

Relations – Parent of every other component.

## App

Responsibility – Combines StateProvider and IdeLayout. No markup here. No props.

## IdeLayout

Responsibility – Layout of SideBar, TopBar, and Notebook Container. No props. No context usage. Only markup.

## TopBar

Top bar with buttons: notebook, reset progress.

Dispatches actions: OPEN_NOTEBOOK and RESET_PROGRESS.

## SidebarNavigationContainer

Shows a collapsible directory tree of topics → levels, handles navigation and progress highlighting.

Use context: topics, currentLevelId, solvedLevels.

## LevelViewportContainer

Container for everything that happens while playing a single level (filename header, editor, chat).

Compute `code` and `regions` for CodeView based on `level.blocks` and `triggeredEvents`.
Delegates this calculation to a utility function from the separate module.

Props: none.

Use context: currentLevel.

Renders CodeView, FixPreviewOverlay, LockUiOverlay, HintOverlay.

## CodeView

Responsibility – Read‑only, syntax‑highlighted code block with typing animation. Adds data‑event-id attributes to clickable substrings and intercepts clicks to dispatch game events (no separate CodeLine or InteractiveSpan).

Props:
- code: string // code lines
- regions: TextRegion[]
- animate: boolean // whether to animate the code
- contentId: number // animation is triggered only when contentId changes
- onEvent: (id: string) => void // called when a region token is clicked
- onMisclick: (line: number, col: number, token: Token | string) => void // called when clicking non-region tokens


```ts
interface EventRegion {
    startLine: number
    startCol: number
    endLine: number
    endCol: number
    eventId: string
}
```

CodeView uses prismjs-react-renderer for syntax highlighting.

Shows line numbers for the code.

## BuddyChat  
  
Renders `buddyMessages` as a scrollable chat UI. Handles message types.

Contains Ask For Help Button.  
  
Fixed-position; dispatches `GET_HINT` on click.


---

# File structure

Store all components in /web/src/components as *.jsx files.

Reducer in /web/src/reducer.js

PyLang EventRegion and applyEvents in /web/src/utils/applyEvents.js

