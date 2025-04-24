/**
 * @typedef {Object} LevelId
 * @property {string} topic - topic ID
 * @property {string} levelId - level ID
 */

/**
 * @typedef {Object} WisdomEntry
 * @property {string} id - unique identifier
 * @property {string} text - wisdom text content
 */

/**
 * @typedef {Object} LevelBlock
 * @property {string} type - block type (text, replace, replace-span, etc.)
 * @property {string} [text] - content text
 * @property {string} [clickable] - highlighted substring for interaction
 * @property {string} [replacement] - replacement text
 * @property {string} [event] - event identifier
 * @property {string} [explanation] - explanation text
 * @property {string} [hint] - hint text
 */

/**
 * @typedef {Object} LevelData
 * @property {string} filename - display name of the level
 * @property {string[]} wisdoms - list of wisdom IDs
 * @property {LevelBlock[]} blocks - content blocks
 */

/**
 * @typedef {Object} Topic
 * @property {string} name - topic name
 * @property {WisdomEntry[]} wisdoms - list of wisdoms
 * @property {LevelData[]} levels - list of levels
 */

/**
 * @typedef {Object} LevelState
 * @property {LevelData} level - level data
 * @property {string[]} triggeredEvents - events triggered by player
 * @property {number} mistakeCount - number of mistakes
 * @property {string|null} currentHintId - id of current hint
 * @property {boolean} isHintShown - whether hint is visible
 * @property {number|null} autoHintAt - time when auto-hint should appear
 * @property {number|null} lockUiUntil - time when incorrect click overlay should hide
 * @property {string|null} justTriggeredEvent - event that was just triggered
 */

/**
 * @typedef {Object} GameState
 * @property {Topic[]} topics - list of all topics
 * @property {LevelId} currentLevelId - current level identifier
 * @property {LevelState} currentLevel - current level state
 * @property {LevelId[]} solvedLevels - list of solved levels
 * @property {string[]} discoveredWisdoms - wisdoms discovered across all levels
 * @property {'opened'|'closed'|'level_finished'} notebookState - state of notebook drawer
 */

/**
 * @typedef {Object} EventRegion
 * @property {number} startLine - starting line
 * @property {number} startCol - starting column
 * @property {number} endLine - ending line
 * @property {number} endCol - ending column
 * @property {string} eventId - event ID
 */
