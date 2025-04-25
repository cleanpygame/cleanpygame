# Clean-Code Game — Development Specification

## 1. Project Overview

**Purpose**  
The Clean-Code Game is an interactive, educational web game designed to teach players clean code principles through hands-on practice. It aims to help developers:

- Learn to recognize common code smells and poor coding patterns  
- Train their ability to analyze and identify problematic code on sight  
- Become familiar with practical refactoring techniques to improve code readability, structure, and maintainability

**Target Audience**  
The game is designed for beginner developers, particularly first-year computer science students. It serves as a companion tool during their initial exposure to real-world programming standards. The game reinforces theoretical programming education by introducing them to common pitfalls and best practices early in their learning journey.

**Primary Language**  
All code examples and exercises will use Python, which is widely taught in academic settings and offers clear syntax that aligns well with teaching clean code principles.

**Educational Focus**  
The game's content is primarily based on:
- **Uncle Bob’s Clean Code** philosophy — focusing on clarity, simplicity, and maintainability  
- Selected elements of **PEP8** — relevant style issues may be highlighted, but not as a primary focus  
- Basic **SOLID principles** — introduced in later stages, once foundational skills are developed

**Usage Mode**  
The game is designed for **solo self-paced learning**, but includes support for use in **classroom environments**:
- Instructors can generate **shareable join-links** to assign specific topic folders  
- Progress of students who join via the link can be **tracked and monitored** by the instructor

**Learning-Centric Design**  
The game emphasizes a **minimal, distraction-free** experience. Gamification is mostly avoided in favor of clarity and learning outcomes. Instead of points or badges, players build a **“pocket notebook”**—a persistent knowledge log that collects every clean-code principle or refactoring pattern they’ve encountered. 
This notebook serves as a growing revision tool the player can refer back to at any time.


---

## 2. Gameplay Mechanics

**Core Gameplay Loop**

Player is guided by a Buddy — a mentor character that provides hints, feedback, and encouragement throughout the game.

Each level presents a short Python code snippet containing several **code smells** or **anti-patterns**. The player’s objective is to visually inspect and **click** on the problematic code elements. Each interaction results in **immediate feedback**:

- ✅ **Correct Click** — Triggers a bad code replacement with the good one and a **Buddy chat message** explaining the issue.
- ❌ **Incorrect Click** — Triggers a small animation feedback and a **Buddy message**: “Nope, not an issue.”
- 🤔 **Subjective Cases** — May trigger a neutral Buddy message if applicable.

The level is complete once **all confirmed issues** are correctly identified and fixed.

**Support & Constraints**

- 🆘 **Ask for Help Button**

  - Triggers a **Buddy hint message** about the first remaining issue.
  - Button is always visible during the level.

- ⏱ **Auto-Hint Mechanic**

  - If the player takes more than 20 seconds without progress, a **Buddy message** gives a wisdom-based hint.

**Level Progression**

- 📘 **Topics & Folders** — Game is divided into topical folders. Players may start any topic.
- 🔁 **Linear Flow Within Topics** — Levels must be completed in sequence.
- 🧭 **Replayability** — Players may revisit completed levels.

**Level Completion**

- 📒 **Wisdom Display** — At the end of a level, all new wisdoms are posted to the **Buddy chat**.
- ➡️ A “Next Level” button in the chat lets players proceed at their own pace.

The entire experience remains **minimal and distraction-free**, emphasizing understanding and reflection over gamified rewards.

---

## 3. UI/UX Design

**Overall Style & Theme**

The interface mimics the layout and color scheme of **Visual Studio Code**, offering a familiar environment for students and aspiring developers. This includes:

- A clean **dark theme** inspired by VS Code defaults  
- Monospaced fonts and **Python syntax highlighting** in all code views  
- Minimalist design, focused on clarity and readability  
- No gamified or decorative elements — the UI supports learning, not entertainment

**Layout**

The main game interface is divided into two key areas:

- 📁 **Left Sidebar – Folder & Level Navigation**  
  - Displays a **directory tree**, similar to the file explorer in VS Code  
  - Folders represent **topics** (e.g., “Naming”, “Duplication”)  
  - Each level is displayed as a **Python source file** (e.g., `onboarding.py`, `understandable.py`)  
  - Completed levels may be marked visually; the current level is highlighted

- 🖥️ **Main Editor Area – Code Display & Interaction**  
  - Displays a **code snippet with Python syntax highlighting**  
  - Players **click directly** on code elements to identify problems  
  - All interactions occur inline or via overlays within this editor area

- 💬 **Buddy Chat Area** —
  - Always visible in the **bottom right corner**
  - Displays feedback for clicks, hints, and level completion wisdoms
  - New messages appear in the bottom. Old messages move up and are available with the scrolling up.

**Interaction Feedback Flow**

- Clicking on code:
  - Triggers small animation
  - Feedback appears as a **message from Buddy** in the persistent chat

**Ask for Help Button**

- Available at all times during the level
- Triggers a Buddy message with a relevant hint

**Animations & Visual Feedback**

- ✅ Small animation on correct or incorrect clicks (e.g., a quick visual pulse or flash)
- 🔄 Code appears with a typing animation when loading new levels
- 🔇 No sound effects — the game is silent

**Wisdom Notebook**

- Accessible via 📒 icon (top right)
- But all newly gained wisdoms also appear directly in **Buddy chat** after level completion

**Interactivity Cues**

- The code editor is intentionally **devoid of hover or clickable hints**  
- There is **no cursor change** and **no highlight on hover**  
- The mouse cursor remains the standard **arrow pointer**, reinforcing the need to read and reason, not guess or hover-hunt

## 4. Data Model

The Clean-Code Game uses a single `levels.json` to store levels, topics and wisdoms.
It is generated by toolchain from a source levels directory with topic descriptions in `JSON` format and level descriptions in `PyLevels` format.

---

### Source Levels Directory

```
levels
  - 01-naming
	- topic.json
    - 01-level1.py
	- 02-level2.py
  - 02-decomposition
    - topic.json
    - 01-level1.py
	...
  ...
```

Each directory in `levels` folder with `topic.json` —— is a topic folder.

* folder name defines the order of the topics in game.
* topic.json defines a topic:

	```json
	{
		"name": "Naming",
		"wisdoms": [
			{
				"id": "wisdomId",
				"text": "some wisdom"
			}
		]
	}
	```

### ✍️ PyLevels Format (Level Source Format)

Each json file in topic directory defines one level. Name of the file defines order of the levels in the topic.

Levels file starts with header directives followed by sequence of blocks.

---

#### 🔹 Header Directives

```text
##filename readable_title.py        # Required — used as display title in UI
##wisdoms id1 id2 ...               # Optional — wisdoms unlocked on level complete
```

---

### #🔹 Block Types

##### 1. Plain Text Block

Text not following a directive is treated as a normal block of visible text.

```text
This is a simple explanation or code section.
```

---

##### 2. Replace Span

Replaces a substring when clicked and triggers EVENT_ID. 
If `-` used for EVENT_ID, then toolchain generates unique event id.

```text
##replace-span EVENT_ID CLICKABLE_SUBSTRING REPLACEMENT
```

---

##### 3. Replace

Replaces one or more lines of code when clicked. Can optionally narrow the clickable area with a substring.

```text
##replace EVENT_ID
<code lines...>
##with
<replacement lines...>
##end
```

With specific clickable area:

```text
##replace EVENT_ID CLICKABLE_SUBSTRING
<code lines...>
##with
<replacement lines...>
##end
```

If `-` used for EVENT_ID or EVENT_ID is missing, then toolchain generates unique event id.

---

##### 4. Neutral feedback

Neutral feedback for subjective issues. May appear anywhere.

```text
##neutral CLICKABLE_SUBSTRING
```
---

##### 5. Explanations and Hints

```text
##explain EXPLANATION
```

Can appear only after blocks triggering events: `replace`, `replace-span` or `neutral` block. Add explanation to prev block.


```text
##hint EXPLANATION
```

Can appear only after `replace-block` and `replace-span`. Add hint to prev block.

##### 6. Replace On

Replaces a block only **after another event has triggered**. Must reuse an existing EVENT_ID.

```text
##replace-on EVENT_ID
<code lines...>
##with
<replacement lines...>
##end
```
---

##### 7. Add On (Syntactic Sugar)

```text
##add-on EVENT_ID
<code lines...>
##end
```

equivalent to

```text
##replace-on EVENT_ID
##with
<code lines...>
##end
```

##### 8. Remove On (Syntactic Sugar)

```text
##remove-on EVENT_ID
<code lines...>
##end
```

equivalent to

```text
##replace-on EVENT_ID
<code lines...>
##with
##end
```


#### 🔐 Authoring Rules

- **CLICKABLE_SUBSTRING**, **REPLACEMENT**, **EXPLANATION** may be enclosed in quotation marks (single or double). 
In that case (and only in that case) escape sequences and spaces can be used in them to represent multiline substrings or substrings with spaces.
- EXPLANATION may be in the format `$wisdomId`. In that case text of the wisdom with id=wisdomId should be used.
- All whitespace and formatting is preserved
- EVENT_ID may be the same for several replacement blocks. In that case triggering any of these blocks executes all the replacements with the same EVENT_ID

---

### 🧾 levels.json Format

Web-application work with this json format:

```json
{
	"topics": [
		{
			"name": "Naming",
			"wisdoms": [
				{
					"id": "wisdomId",
					"text": "some wisdom"
				} 
			],
			"levels": [
			
			]
		}
	]
}
```

Each level is compiled into a single JSON object with the following structure:

```json
{
  "filename": "onboarding.py",
  "wisdoms": ["naming-descriptive", "keep-it-simple"],
  "blocks": [
    {
      "type": "text",
      "text": "val answer: Int = 42\nval question: String? = null"
    },
    {
      "type": "replace-span",
      "clickable-substring": "foo",
      "replacement": "describe_user",
      "event": "rename-function",
	  "explanation": "this is optional explanation",
	  "hint": "some optional hint"
    },
    {
      "type": "replace",
      "text": "def foo():\n    print('Hello')",
      "replacement": "def describe_user():\n    print('Hello')",
      "event": "rename-function",
	  "explanation": "this is optional explanation",
	  "hint": "some optional hint"
    },
    {
      "type": "replace-on",
      "text": "print(foo())",
      "replacement": "print(describe_user())",
      "event": "rename-function"
    },
    {
      "type": "neutral",
      "clickable-substring": "data",
      "explanation": "The variable name 'data' is vague. In some teams, this may be discouraged, but not always."
    }
  ]
}
```

This structure is designed for easy rendering in the frontend and consistent mapping from the authoring format.


## 5. Technical Architecture & Deployment Plan

---

### ⚙️ Frontend Architecture

The game is built as a **single-page web application (SPA)**, using lightweight, modern tools focused on readability and interaction rather than code editing.

**Tech Stack Summary**

| Part                | Tech                   | Purpose                                               |
|---------------------|------------------------|-------------------------------------------------------|
| Framework           | React                  | UI rendering, component model, state management       |
| Syntax Highlighting | Prism.js or Refractor  | Lightweight, read-only syntax highlighting for Python |
| Styling             | Tailwind CSS           | Utility-first styling, matches VS Code feel           |
| Interactions        | Custom logic via React | Tooltips, overlays, game state, event triggers        |

> **Rationale:**  
> Heavy editors like Monaco are avoided. Prism.js (or Refractor for advanced cases) provides the necessary highlighting with full control over rendering, performance, and custom overlays.

---

### 🏗️ Application Structure

**Client-Only Architecture (MVP)**

The game is primarily **client-side**:
- All levels and wisdoms are stored as static JSON/YAML files
- Loaded dynamically when a topic or level is selected
- Game logic, event handling, and UI state are entirely local

This makes hosting simple and cost-effective.

---

### ☁️ Hosting & Deployment

**Deployment Target:**  
- GitHub Pages  
- or Vercel  
- or Netlify  

> These platforms offer **free hosting**, fast static file serving, and automatic deployment from Git pushes.

**Build Tools:**
- Vite or Create React App (Vite recommended for faster builds)
- Markdown/YAML parser (e.g., `js-yaml`) for loading level content

---

### 🔥 Backend with Firebase (Future Phase)

Firebase can be added later to support classroom use cases with no backend maintenance.

#### 🔑 Key Features
- **Firestore** — Store player progress, group memberships, wisdoms unlocked
- **Authentication** — Anonymous sign-in or email-based logins
- **Cloud Functions** — Trigger actions on level completion, wisdom unlocks, group join events
- **Hosting** — Optionally serve the entire game from Firebase Hosting
- **Security Rules** — Ensure users can only read/write their own data

#### 👩‍🏫 Classroom Integration
- Teachers generate a shareable join link like `/?group=abc123`
- Any student using that link is automatically tracked under that group
- Teachers can see aggregate progress for the group

#### 🧾 Example Progress Entry
```json
{
  "playerId": "xyz123",
  "groupId": "abc123",
  "level": "naming/onboarding",
  "finished": true,
  "timestamp": "...",
  "unlockedWisdoms": ["naming-descriptive"]
}
```

#### 💰 Cost
Firebase is **free** at small scale (ideal for classroom projects):
- 50K reads/day, 20K writes/day
- 1GB stored
- 125K Cloud Function calls/month

It's scalable, secure, and removes the need to run your own backend server.

---

This hybrid model — client-first with a plug-in backend — allows you to **move fast now** and **scale later** without rewriting the foundation.

# Summary of Changes: v1 to v2

The updated specification introduces several key changes that enhance the learning experience of the Clean-Code Game, particularly through the addition of a mentor-like character and revised interaction dynamics.

## Key Changes

### 1. Buddy System
A major shift is the introduction of a **“Buddy”** — a mentor character who provides feedback, hints, and encouragement through a persistent chat interface. This replaces the prior neutral tooltips and explanation panels, making the interaction feel more conversational and guided.

### 2. Hint Mechanics
- The original auto-hint system after 20 seconds remains but now delivers hints through the Buddy.
- A new **"Ask for Help" button** allows players to request hints proactively at any time, increasing accessibility and user agency.

### 3. Feedback Presentation
- Feedback for correct, incorrect, or subjective interactions now appears as chat messages from the Buddy, instead of tooltips or floating UI panels.
- Visual feedback is enhanced with small animations on clicks, offering clearer responses to player actions.

### 4. Wisdom Delivery
- Previously, newly learned wisdoms were highlighted in a separate notebook interface.
- Now, they are also displayed directly in the Buddy chat after level completion, creating a more integrated reflection loop.

### 5. UI Enhancements
- The Buddy chat area is permanently docked in the bottom-right corner, offering a consistent interface for guidance and progress acknowledgment.
- While the core layout (VS Code-style editor and sidebar navigation) remains, the chat overlay adds a new dimension of interactivity without compromising the distraction-free philosophy.

### 6. No Changes in Content Structure or Technical Stack
The backend model (levels.json format, authoring tools, and deployment architecture) remains unchanged, ensuring full compatibility and ease of migration from the earlier version.

These revisions aim to make the game more supportive and engaging without introducing traditional gamification, aligning with its pedagogical goals while improving user experience.
