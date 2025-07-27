/**
 * Utility functions for working with levels and topics
 */

import {GameState} from '../types';

/**
 * Creates a level key in format topic__levelFilenameWithoutExtension
 * @param topic - The topic name
 * @param levelId - The level ID
 * @returns The level key
 */
export const getLevelKey = (topic: string, levelId: string): string => {
    return `${topic}__${levelId.replace('.py', '')}`;
};

/**
 * Creates a level key from the current level ID in the game state
 * @param state - The game state
 * @returns The level key for the current level
 */
export const getCurrentLevelKey = (state: GameState): string => {
    return getLevelKey(state.currentLevelId.topic, state.currentLevelId.levelId);
};

/**
 * Checks if a level is solved
 * @param state - The game state
 * @param topic - The topic name
 * @param levelId - The level ID
 * @returns Whether the level is solved
 */
export const isLevelSolved = (state: GameState, topic: string, levelId: string): boolean => {
    // Create level key in format topic__levelFilenameWithoutExtension
    const levelKey = getLevelKey(topic, levelId);

    // Check if the level exists in playerStats.levels and has been completed at least once
    return state.playerStats.levels[levelKey]?.timesCompleted > 0;
};

/**
 * Checks if a level is the current level
 * @param state - The game state
 * @param topic - The topic name
 * @param levelId - The level ID
 * @returns Whether the level is the current level
 */
export const isCurrentLevel = (state: GameState, topic: string, levelId: string): boolean => {
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
 * @param state - The game state
 * @param topic - The topic name
 * @param levelId - The level ID
 * @returns Whether the level is clickable
 */
export const isLevelClickable = (state: GameState, topic: string, levelId: string): boolean => {
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