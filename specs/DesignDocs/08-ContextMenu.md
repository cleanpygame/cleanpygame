# 📄 Design Document: Context Menu on Code Click

## Requirements

* When a user clicks on a `replace` or `replace-span` block that defines an `options` array in its level description,
  display a context menu instead of immediately applying the change.
* The `options` array must contain between 1-3 entries; each entry must include:
    * `id`: to identify option.
    * `label`: the text to display for the option.
    * `correct`: a boolean flag indicating whether this option is the single correct choice.
* If no `options` array is defined on the clicked block, fallback to the existing click behavior (apply the
  replace/replace-span change immediately).
* If the user selects an incorrect option, display an error message in the Buddy chat: e.g., "No‑no, that’s not
  it—please try again." and close the menu.
* If the user selects the correct option, apply the replacement as if it were a standard click.

## Design

This feature introduces an optional multiple-choice step for a subset of `replace` and `replace-span` blocks. If
present, the UI shows a context menu with 1–3 options; the player must pick the single correct answer to apply the
change. The implementation spans the levels format (source PyLevels and compiled JSON), levels compiler, frontend state,
UI components, and tests.

### 1. Level Format, Parser, Utils, and Documentation

1.1 PyLevels (authoring) format additions

- Scope: Only directly after `##end` or `##replace-span`
- Syntax: introduce an optional `##option` section to define one option for menu.
  Example (replace-span):
  ```text
  ##replace-span rename-var "usr" "user"
  ##option good id1 "Rename to 'user'"
  ##option bad id2 "Rename to 'u'"
  ##option bad id3 "Extract function"
  ```
  Example (replace):
  ```text
  ##replace rename-func
  def foo():
      pass
  ##with
  def user():
      pass
  ##end
  ##option good id1 "Rename to 'user'"
  ##option bad id2 "Rename to 'u'"
  ##option bad id3 "Inline function"
  ```
- Semantics:
    - When `##option` exists, it should be added to the previous block on parsing.
    - Each option requires: `good|bad` to define correctness of the option, `id` (string without spaces), `label` (
      quoted string).

1.2 Compiled levels.json additions

- Extend existing block objects with optional `options` property.
- Schema for both `replace` and `replace-span` blocks:
  ```json
  {
    "type": "replace-span",
    "clickable": "usr",
    "replacement": "user",
    "event": "rename-var",
    "options": [
      { "id": "correct", "label": "Rename to 'user'",  "correct": true },
      { "id": "wrong1",  "label": "Rename to 'usr_name'", "correct": false }
    ]
  }
  ```
- Validation rules in compiler:
    - At least one `correct: true`.
    - All options must have unique `id` and non-empty `label`.

1.3 levels_compiler changes

- Parser (levels_compiler/parser.ts):
    - Use similar approach as for hint and explain handling.

1.4 Documentation updates

- Update DesignDocs/01-LevelsFormat.md:
    - Document the optional `##options` section for `replace` and `replace-span`.
    - Extend the example JSON block objects to show `options`.
    - State validation and defaults explicitly (1–3 entries, exactly one correct).
- Update web/levels/LEVELS_RULES.md (author guidelines) to include authoring examples and best practices for the new
  section.

### 2. State Management (Frontend)

- Reducer shape changes (e.g., game/ui reducer):
    - Add transient UI state for the options menu.
  ```ts
  type ContextMenuState = {
    visible: boolean;
    event?: string;             // block.event for follow-up replacements
    options?: { id: string; label: string; correct: boolean }[];
    anchor?: { x: number; y: number }; // screen coordinates for popover
  };
  ```
    - Extend global state: `{ ui: { optionsMenu: OptionsMenuState, ... } }`.
- Actions:
    - `SELECT_CONTEXT_MENUITEM({ optionId })`
- Reducer behavior:
    - SELECT_CONTEXT_MENUITEM closes menu and:
        - If selected option is correct → dispatch existing action path that applies a block replacement (reuse current
          APPLY_BLOCK/APPLY_EVENT).
        - If incorrect → dispatch Buddy message action with the error string and keep the code unchanged.
- Edge handling:
    - Clicking outside or pressing Escape → CLOSE_OPTIONS_MENU.
    - If a block becomes invalid (already applied due to other event) while menu is open → auto-close.
      -Ai CoAuthor: generation of hints and explain also should generate options.

### 3. UI: New/Changed Components

- New components:
    - ContextMenu
        - Props: `{ options, position, onSelect, onClose }`
        - Renders menu items with labels.
        - Click outside closes popover (Portal attached to body).
    - MenuItem (internal helper)
- Changes to existing components:
    - Code rendering component (e.g., LevelViewportContainer.tsx):
        - On click:
            - If `block.options?.length` is truthy → open context menu
            - Else → run existing immediate-apply flow.
    - Buddy chat utils/messages:
        - Add a standardized error message producer for incorrect choices, default: "No‑no, that’s not it—please try
          again." Allow override in future via level metadata.

### 4. Testing Approach

- Levels compiler (TypeScript):
    - Unit tests for parser:
        - Parses valid `##options` for `replace` and `replace-span` with 1, 2, and 3 entries.
    - Snapshot test of compiled JSON for a sample level with options.
- Frontend reducers.

### Rollout Plan

- Step 1: Create a single demo level in a hidden topic (inDevelopment) to manually verify.
- Step 2: Implement compiler parsing + validation and add docs/examples.
- Step 3: Add frontend state + UI popover and guarded click handling.
- Step 4: Add tests (compiler, reducers) and green build.
- Step 5: Fix Ai CoAuthor to generate context menu options
