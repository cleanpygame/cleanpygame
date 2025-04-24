# State Shape

```ts

interface GameState {
  topics: Topic[]                   // list of all topics with levels read from levels.json
  currentLevelId: LevelId
  currentLevel: LevelState          // transient state for the open level
  solvedLevels: LevelId[]
  discoveredWisdoms: string[]      // list of wisdom IDs unlocked across all levels
  notebookState: 'opened' | 'closed' | 'level_finished' // state of notebook drawer
}

interface LevelState {
  level: LevelData                // level data (filename, blocks, ...)
  triggeredEvents: string[]       // in-level progress: all event IDs the player has clicked in this level
  mistakeCount: number            // number of incorrect clicks so far
  currentHintId: string | null    // next hint to show
  isHintShown: boolean            // is the current hint shown right now?
  autoHintAt: number | null       // time (ms of epoch) when the auto-hint should be shown
  lockUiUntil: number | null    // show/hide lockUiOverlay overlay until this moment (ms of epoch)
  justTriggeredEvent: string | null      // if not null show correct click overlay for that event
}

interface LevelId {
  topic: string                    // topic ID
  levelId: string                  // level ID
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

# Actions

We’ll drive updates via a reducer with these action types:

* **LOAD_LEVEL**
  * payload: `{ levelId: LevelId }`
  * sets `currentLevelId` and `currentLevel` to the level with the given ID with zero progress.
  * `autoHintAt = Date.now() + 20_000`

* **LOCK_AFTER_MISTAKE**
  * payload: none
  * `currentLevelState.mistakeCount += 1`
  * `currentLevelState.lockUiUntil = Date.now() + mistakeCount * 1000`

* **UNLOCK**
  * payload: none
  * `currentLevelState.lockUiUntil = null`

* **OPEN_FIX_PREVIEW**
  * payload: `{ eventId: string }`
  * `currentLevel.justTriggeredEvent = eventId`
  * `autoHintAt = null`

* **CONFIRM_FIX**
  * payload: `{ eventId: string }`
  * appends `eventId` to `currentLevel.triggeredEvents` (idempotent)
  * `currentLevel.justTriggeredEvent = null`
  * `currentLevel.isHintShown = false`
  * calculates `currentLevel.currentHintId` (id of the first non-triggered event with an attached hint)
  * `autoHintAt = Date.now() + 20_000`

* **SHOW_HINT**
  * payload: none
  * `currentLevel.isHintShown = true`
  * `autoHintAt = Date.now() + 20_000`

* **HIDE_HINT**
  * payload: none
  * `currentLevel.isHintShown = false`

* **RESET_PROGRESS**
  * payload: none
  * revert state to initial value, resetting all the progress.
  * `autoHintAt = Date.now() + 20_000`

* **OPEN_NOTEBOOK**
  * payload: `{ mode: 'opened' | 'level_finished' }`
  * sets `notebookState` to passed mode

* **CLOSE_NOTEBOOK**
  * payload: none
  * sets `notebookState` to `closed`

* **NEXT_LEVEL**
  * payload: none
  * sets `notebookState` to `closed`
  * adds `currentLevelId` to `solvedLevels`
  * adds `level.wisdoms` to `discoveredWisdoms` (idempotent)
  * sets `currentLevelId` to the next level in the list of topics
  * sets `currentLevel` to the level with the new ID with zero progress.
  * `autoHintAt = Date.now() + 20_000`


# Components

```
App
└─ StateProvider
    └─ GameContainer
        ├─ NotebookDrawer
        ├─ TopBar
        ├─ SidebarNavigationContainer
        └─ LevelViewportContainer
            ├─ CodeView
            ├─ HintOverlay
            ├─ FixPreviewOverlay
            └─ LockUiOverlay
```
Containers use data from Context. Other components are pure props-driven components.

## StateProvider

Responsibility – Owns global reactive state (current topic/level, wisdoms, lock‑out timers) and exposes actions through React Context.

Public interface – No props; wraps the rest containers.

Relations – Parent of every other component.

## App

Responsibility – Combines the VS‑Code‑style two‑pane layout and the slim top bar (📒 button).

Props: none.

Children are fixed: sidebar & viewport.

## TopBar

Responsibility – Top bar with a notebook button and a reset progress button.

Props:
* onNotebook(): void – callback for notebook button
* onReset(): void – callback for reset progress button

## SidebarNavigationContainer

Responsibility – Shows a collapsible directory tree of topics → levels, handles navigation and progress highlighting.

Props: none.

From context: topics, currentLevel, progress.currentLevels, dispatch.

Relations – Child of App.

## LevelViewportContainer

Responsibility – Container for everything that happens while playing a single level (filename header, editor, overlays, completion banner).

Starts timers for auto-hints and incorrect click overlays. 

Dispatches HIDE_INCORRECT_OVERLAY and OPEN_HINT actions correspondingly.

Compute `lines` and `regions` for CodeView based on `level.blocks` and `triggeredEvents`.
Delegates this calculation to a utility function from the separate module.

Props: none.

From context: currentLevel, dispatch.

Renders CodeView, FixPreviewOverlay, LockUiOverlay, HintOverlay.

## CodeView

Responsibility – Read‑only, syntax‑highlighted code block with typing animation. Adds data‑event-id attributes to clickable substrings and intercepts clicks to dispatch game events (no separate CodeLine or InteractiveSpan).

Props:
* lines: string[] - content
* regions: EventRegion[] - list of regions to trigger events on click
* typingAnimationProgress: number — now many tokens to show right now.
* onEvent(id: string): void – callback for event clicks.
* onMisclick(line: string, column: number): void – callback for incorrect clicks.

```ts
interface EventRegion {
    startLine: number
    firstToken: number
    endLine: number
    lastToken: number
    eventId: string
}
```

CodeView uses prismjs-react-renderer for syntax highlighting.

Shows line numbers for the code.

## FixPreviewOverlay

Responsibility – Composite panel that appears after a correct click; shows explanation, before/after diff, and an “Apply” button.

Props:

* explanation: string
* before: string
* after: string
* onApply(): void

## LockUiOverlay

Responsibility – tooltip component for incorrect‑click feedback.

It shows a tooltip on top of the parent component with a message and a lockout timer.

Props:

* message: string – tooltip text
* lockoutMs: number – progressive delay

## HintOverlay

Responsibility – component that shows the hint 
(a-la new chat message notification popup in right bottom corner of the parent component).

Has "X" close button.

Props:

* message: string


## NotebookDrawer

Responsibility – Side drawer (portal) that lists unlocked wisdoms, grouped by topic.
Is shown after the level is finished.

Uses simple nested headings—no separate topic/entry components.

in level_finished mode, it shows congratulations and a “Next” button to continue to the next level.

Props:

* isOpen: boolean
* mode: 'opened' | 'level_finished'
* wisdoms: WisdomEntry[]
* newIds: string[] // wisdom IDs to highlight as new
* onClose(): void
* onNext(): void  

Relations – Sibling portal of Shell.

# File structure

store all components in /web/src/components as *.jsx files.
