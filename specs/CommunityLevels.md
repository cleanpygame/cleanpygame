# Feature Design Document: "Create Level" Editor for Python Game Web App

## Overview

We are introducing a new feature in the web application: a “Create Level” button that allows users to design their own
game levels using an in-browser code editor.
The editor supports PyLevels syntax (see LEVELS_FORMAT.md).
User-created levels will be stored in Firebase and integrated into the level selection UI under personalized section *
*My Levels**.

---

## User Flow

1. **Initiating Level Creation**

    * User clicks the "Create New" button.
    * A new code editor opens inside the web app.

2. **Editing and Validation**

    * Editor provides Python syntax highlighting.
    * Real-time PyLevels syntax validation is performed client-side.
    * If syntax is correct and the level parses successfully, the “Save” button becomes enabled.

3. **Saving the Level**

    * Upon clicking “Save”:

        * The level is stored in Firebase under the user's personal space.
        * It appears under the **My Levels** topic in the UI.
        * When My Level is selected, a button Edit is available. It opens the Editor again.

4. **Sharing and Discovery**

    * Each level can be shared via a unique URL. (Need a button for it)
    * When another user opens this URL:

        * The shared level becomes permanently visible to them under **My Levels**.
        * It is not duplicated but linked.

---

## UI Prototypes

### Sidebar Navigation

* New topic "My Levels" should appear in the SidebarNavigation.
* "Create New" button is located in the "My Level" topic as a first element.
* Click on the "Create New" button opens the Level Editor.
* Click on the level in "My Levels" runs this level.
* Each level of player ownership in "My Levels" has an "Edit" button. Clicking it opens the Level Editor.

### Level Editor

* It should have its own route: /editor
* Level Editor Page replaces the whole Ide Layout.
* It consists of four areas:
    * Top — extracted filename, Save, Share and Cancel Buttons
    * Main Middle with Code Editor to the left and PyLevel format to the right
    * Bottom — Errors found in the code.
* Use the CodeMirror component for editing the code in Code Editor. Do not use CodeView.
* Use Python syntax highlighting in Code Editor
* Use parser.ts logic to validate the code in the Code Editor in real time and show errors in the Bottom part.
* Share button copies the link to the clipboard: {domain}/community-levels/{levelId}
* Save Button saves the level in DB, closes the Editor and Runs the level.

### Running Community Levels

* When a user clicks on the level in "My Levels", the path should become "/community-levels/{levelId}"
* The level should be run in the same way as any other level. parser.ts is used to parse the level from PyLevel format.
* When the link /community-levels/{levelId} opened and the level
  it should be added to the "My Levels".

---

## Firebase Data Model

### 1. Collection: `customLevels`

Stores all user-created levels.

* **Document ID**: `level_id` (unique identifier)
* **Fields**:

    * `content`: string (PyLevels format)
    * `author_id`: string (UID of the creator)
    * `filename`: string (extracted from content)
    * `created_at`: timestamp
* **Permissions**:

    * Read: Public
    * Write: Only by `author_id`

### 2. Collection: `userLevels`

Tracks which custom levels are visible to a user.

* **Document ID**: `user_id`
* **Subcollection**:

    * `levels`: array of objects, each containing:

        * `level_id`: string
* **Permissions**:

    * Read/Write: Only the respective user

---

## Loading Logic

* When displaying the **Shared Levels** topic:

    1. Fetch `userLevels/<user_id>/levels`.
  2. Fetch the `content` from `customLevels/<level_id>` to load the level.

* When a shared link is visited:

    1. Add the `level_id` to the current user’s `userLevels`.

---

## Future Considerations

* Optional tagging or categorization of levels.
* Public level discovery and browsing.
* Forking/editing levels created by others.
* Version history or backups of edited levels.