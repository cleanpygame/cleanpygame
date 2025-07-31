# Frontend Architecture Design Document

## Tech Stack

| Part                | Tech                 | Purpose                                               |
|---------------------|----------------------|-------------------------------------------------------|
| Framework           | React                | UI rendering, component model, state management       |
| Syntax Highlighting | prism-react-renderer | Lightweight, read-only syntax highlighting for Python |
| Styling             | Tailwind CSS         | Utility-first styling, matches VS Code feel           |

## State Shape

```ts
interface GameState {
    topics: Topic[]                   // list of all topics with levels from levels.json
    currentLevelId: LevelId
    currentLevel: LevelState          // transient state for the open level
    solvedLevels: LevelId[]
    chatMessages: ChatMessage[]      // chat history from the Buddy mentor
}

interface LevelState {
    level: LevelData                  // level data (filename, blocks, ...)
    code: string                      // code to be displayed in the editor
    regions: EventRegion[]            // list of regions with events
    triggeredEvents: string[]         // in-level progress: all event IDs clicked
    pendingHintId: string | null      // ID of the next hint to send via chat, ID is a blockId if the block with the hint
    autoHintAt: number | null         // timestamp (ms) when auto-hint should post
}

interface ChatMessage {
    type: 'me' | 'buddy-instruct' | 'buddy-explain' | 'buddy-help' | 'buddy-reject' | 'buddy-summarize'
    text: string
}

// levels.json:
interface Topic {
    name: string
    levels: LevelData[]
}

interface LevelData {
    filename: string
    blocks: LevelBlock[]
}
```

## Actions

- **POST_BUDDY_MESSAGE**
    * payload: `{ message: ChatMessage }`
    * Dispatch to append a new chat entry (correct/incorrect feedback, hints).

- **GET_HINT**
    * payload: none
    * dispatches `POST_BUDDY_MESSAGE({ type: 'buddy-help', text: pendingHintBlock.hint })`
    * `autoHintAt = Date.now() + AUTOHINT_DELAY`
    * `pendingHintId = null`

- **LOAD_LEVEL**
    * payload: `{ levelId: LevelId }`
    * sets `currentLevelId` and `currentLevel` to the level with the given ID with zero progress.
    * calculates `currentLevel.pendingHintId` (id of the first non-triggered event with an attached hint)
    * Dispatches `POST_BUDDY_MESSAGE({ type: 'buddy-instruct', text: currentLevel.startInstructions })`.
    * `autoHintAt = Date.now() + AUTOHINT_DELAY`

- **CODE_CLICK**
    * payload: `{ lineIndex: number, colIndex: number, token: string }`
    * dispatches APPLY_FIX or WRONG_CLICK depending on click position, and state.regions.

- **APPLY_FIX**
    * payload: `{ eventId: string }`
    * Appends `triggeredBlock.eventId` to `triggeredEvents`.
    * Update regions and code with the help of `applyEvents`.
    * calculates `currentLevel.pendingHintId`
    * Dispatches `POST_BUDDY_MESSAGE({ type: 'me', text: '<TOKEN> in line <LINE>' })`.
    * Dispatches `POST_BUDDY_MESSAGE({ type: 'buddy-explain', text: triggeredBlock.explanation })`.
    * Dispatches `POST_BUDDY_MESSAGE({ type: 'buddy-summarize', text: 'Great job!' })` if all issues are fixed.
    * `autoHintAt = Date.now() + AUTOHINT_DELAY`
-
- **WRONG_CLICK**
    * payload: `{ lineIndex: number, colIndex: number, token: string }`
    * Dispatches `POST_BUDDY_MESSAGE({ type: 'me', text: '<TOKEN> in line <LINE>' })`.
    * Dispatches `POST_BUDDY_MESSAGE({ type: 'buddy-reject', text: 'Nope. not an issue' })`.
    * `autoHintAt = Date.now() + AUTOHINT_DELAY`

* **NEXT_LEVEL**
    * payload: none
    * adds `currentLevelId` to `solvedLevels`
    * sets `currentLevelId` to the next level in the list of topics
    * sets `currentLevel` to the level with the new ID with zero progress and empty buddy messages.
    * `autoHintAt = Date.now() + AUTOHINT_DELAY`
    *
* **RESET_PROGRESS**
    * payload: none
    * revert state to initial value, resetting all the progress.
    * `autoHintAt = Date.now() + AUTOHINT_DELAY`

## Components

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

Containers use data from Context. Other components are pure props-driven components.

## StateProvider

Responsibility – Owns global reactive state (current topic/level, lock‑out timers) and exposes actions through React
Context.

Public interface – No props; wraps the rest containers.

Relations – Parent of every other component.

## App

Responsibility – Combines StateProvider and IdeLayout. No markup here. No props.

## IdeLayout

Responsibility – Layout of SideBar and TopBar. No props. No context usage. Only markup.

## TopBar

Top bar with buttons: reset progress.

Dispatches actions: RESET_PROGRESS.

## SidebarNavigationContainer

Shows a collapsible directory tree of topics → levels, handles navigation and progress highlighting.
Lightweight visual, no borders, no shadows, just text, small icons for topics and indentation of the levels.

Clickable levels:

- all completed levels are clickable.
- first level in each topic is clickable.
- next level after any completed level is clickable.
- all other levels are disabled.

When a level is clicked, it dispatches `LOAD_LEVEL` action.

Use context: topics, currentLevelId, playerStats.

## LevelViewportContainer

Container for everything that happens while playing a single level (filename header, editor, chat).

Props: none.

Use context: currentLevel.

Renders CodeView, BuddyChat.

## CodeView

Read‑only, syntax‑highlighted code with click interception, and typing animation.

Layout: should take full free parent client height and width. Shows line numbers for the code.

Import `prism-react-renderer` for syntax highlighting.

```js
import {Highlight, themes} from 'prism-react-renderer';
```

Typing animation should happen ONLY on the first render of the same content.
Changing the code property without changing the contentId prop should NOT trigger typing animation.
After all text appeared after typing animation, it is disabled until contentId is changed.
So even if the code changes to the larger one — no typing animation should happen.

Typing animation speed: 5 characters in 10ms.

Props:

- code: string // code lines
- animate: boolean // whether to animate the code
- contentId: number // animation is triggered only when contentId changes
- onClick: (line: number, col: number, token: string) => void // called when a code is clicked

```ts
interface EventRegion {
    startLine: number
    startCol: number
    endLine: number
    endCol: number
    eventId: string
}
```

## BuddyChat

Renders `buddyMessages` as a scrollable chat UI. Handles message types.
All messages are vertically aligned to the bottom.
**New messages** are appended to the **bottom of the chat**.

The width of the chat is 25% of the viewport width.
The chat becomes scrollable if the content is larger than the viewport height.
When a new message appears, the chat scrolls to the bottom.

Fixed-position; dispatches `GET_HINT` on click.

### Message types

- **me** — my messages appeared after code or button clicks.
- **buddy-XXX* — are messages from Buddy. They are rendered in bubble aligned to the left with a small Buddy Avatar on
  the left side.
- all buttons should be rendered blow all messages in the area where one expects to have an edit-box to send messages.
  So button click emulates typing and sending a message to Buddy.

| type            | text-color | back-color | button                             | bubble-align | 
|-----------------|------------|------------|------------------------------------|--------------|
| me              | default    | light      | "I need help!", neutral color      | right        |
| buddy-instruct  | default    | dark       | "Got it!", accent color            | left         |
| buddy-explain   | green      | dark       | "I need help!", neutral color      | left         |
| buddy-help      | default    | dark       | "I need help!", neutral color      | left         |
| buddy-reject    | red        | dark       | "I need help!", neutral color      | left         |
| buddy-summarize | default    | dark       | "Next task, please!", accent color | left         |

## File structure

Store all components in /web/src/components as *.jsx files.

Reducer in /web/src/reducer.js

PyLang EventRegion and applyEvents in /web/src/utils/applyEvents.js

## Testing

### Reducer Tests

* check that all levels can be solved one by one.