# 📄 Design Document: Integration of AI Co-Author into Level Editor

## 1. Editor Page UI Changes

* The current documentation panel on the Editor Page is replaced with a **tabbed view**.
* The tabs are:
    * **"Documentation"** — shows existing level documentation.
    * **"AI"** — provides AI-assisted generation tools.
*
* The **"AI" tab** includes:
    * A **text field** for entering the Gemini Flash API key.
        * This key is **stored in Local Storage** after editing.

    * A group of **"Generate" buttons**:

        * **Start and Final Messages** — single button.
        * For each event in the level (parsed and extracted on the fly):
          **Hint and Explain** — one button per event.

---

## 2. Functionality of AI Buttons

### 2.1 Start and Final Messages

* When pressed, this button:

    * Renders the level in its **initial state** and **final state**.
    * Constructs a prompt:

        * Containing the initial and final code.
        * Request to generate:
            * A Buddy-style comment for the initial code.
            * Reply of the player to the initial comment.
            * A Buddy-style comment after transforming the initial code into the final code.
            * Next Level button text (reply to the final comment)
    * Updates the **parsed level data** with generated messages.
    * Serializes the level back into text.
    * Displays updated level text in the **left panel** of the Editor Page.

### 2.2 Hint and Explain (per event)

* For a specific event, when the button is pressed:

    * Render the level.
    * Save the code **before** applying the event.
    * Apply the event (simulate the transformation).
    * Save the code **after** the event is applied.
    * If before and after are the same — search for the prerequisite events
        * Try to apply some random events other than the target event
        * Repeat until the code changes
    * Use the "before/after" pair to construct a prompt asking:

        * A **Hint**:
            * Should not include a direct answer.
            * Should guide the player to refactor or adjust the code.
        * An **Explanation**:
            * Should carry **educational value**, explaining what happened and why.
    * Update the **parsed level data** with the new Hint and Explanation.
    * Serialize the level and show the result in the **left panel** of the Editor Page.

---

## 3. API Key Handling

* The user can input an API key for the Gemini Flash model.
* This key is:

    * Editable within the AI tab.
    * Persisted in the browser’s **Local Storage**.

---

## 4. Code Organization

* All logic for LLM prompt construction and response handling must be encapsulated in a **separate module**.
* This module is responsible for:

    * Building prompts from level state.
    * Parsing and applying model responses.
    * Managing communication with the Gemini Flash API.

---

## 5. Testing

* Write **unit tests** for the LLM module.
* Test cases must include:

    * Prompt construction for:

        * Start and Final Messages.
        * Hint and Explain messages for events.
    * Proper parsing and transformation of LLM responses into level structure.
    * Resilience to invalid or malformed responses.
