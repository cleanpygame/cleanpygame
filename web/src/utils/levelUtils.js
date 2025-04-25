/**
 * Utility functions for working with levels and topics
 */

/**
 * Checks if a level is solved
 * @param {Object} state - The game state
 * @param {string} topic - The topic name
 * @param {string} levelId - The level ID
 * @returns {boolean} - Whether the level is solved
 */
export const isLevelSolved = (state, topic, levelId) => {
    return state.solvedLevels.some(
        level => level.topic === topic && level.levelId === levelId
    );
};

/**
 * Checks if a level is the current level
 * @param {Object} state - The game state
 * @param {string} topic - The topic name
 * @param {string} levelId - The level ID
 * @returns {boolean} - Whether the level is the current level
 */
export const isCurrentLevel = (state, topic, levelId) => {
    return (
        state.currentLevelId &&
        state.currentLevelId.topic === topic &&
        state.currentLevelId.levelId === levelId
    );
};

/**
 * Determines if a level is clickable based on the rules:
 * - All solved levels are clickable
 * - First level in each topic is clickable
 * - Next level after any solved level is clickable
 * - All other levels are disabled
 *
 * @param {GameState} state - The game state
 * @param {string} topic - The topic name
 * @param {string} levelId - The level ID
 * @returns {boolean} - Whether the level is clickable
 */
export const isLevelClickable = (state, topic, levelId) => {
    // Rule 1: All solved levels are clickable
    if (isLevelSolved(state, topic, levelId)) {
        return true;
    }

    // Find the topic object
    const topicObj = state.topics.find(t => t.name === topic);
    if (!topicObj) return false;

    // Rule 2: First level in each topic is clickable
    if (topicObj.levels.length > 0 && topicObj.levels[0].filename === levelId) {
        return true;
    }

    // Rule 3: Next level after any solved level is clickable
    // Find the index of the current level in the topic
    const levelIndex = topicObj.levels.findIndex(l => l.filename === levelId);
    if (levelIndex <= 0) return false; // Not found or first level (already handled)

    // Check if the previous level is solved
    const previousLevel = topicObj.levels[levelIndex - 1];
    return isLevelSolved(state, topic, previousLevel.filename);
};