import {PlayerLevelStats, PlayerStatsState} from '../types';
import {GameAction} from './actionCreators';
import {RESET_PROGRESS, SET_PLAYER_STATS, UPDATE_LEVEL_STATS} from './actionTypes';

/**
 * Create default level statistics
 * @returns Default level statistics
 */
export const createDefaultLevelStats = (): PlayerLevelStats => ({
    timesCompleted: 0,
    totalTimeSpent: 0,
    totalHintsUsed: 0,
    totalMistakesMade: 0,
    minTimeSpent: Number.MAX_SAFE_INTEGER,
    minHintsUsed: Number.MAX_SAFE_INTEGER,
    minMistakesMade: Number.MAX_SAFE_INTEGER
});

/**
 * Create default player statistics
 * @returns Default player statistics
 */
export const createDefaultPlayerStats = (): PlayerStatsState => ({
    summary: {
        totalTimeSpent: 0,
        totalLevelsSolved: 0,
        totalLevelCompletions: 0,
        totalHintsUsed: 0,
        totalMistakesMade: 0
    },
    levels: {}
});

/**
 * Reducer for player statistics
 * @param state - Current player statistics state
 * @param action - Action to perform
 * @returns New player statistics state
 */
export function statsReducer(
    state: PlayerStatsState = createDefaultPlayerStats(),
    action: GameAction
): PlayerStatsState {
    switch (action.type) {
        case UPDATE_LEVEL_STATS: {
            const {levelKey, stats, timeSpent, isCompleted, hintsUsed, mistakesMade} = action.payload;

            // Get current level stats or create default if not exists
            const currentLevelStats = state.levels[levelKey] || createDefaultLevelStats();

            // Calculate new level stats
            const newLevelStats: PlayerLevelStats = {
                ...currentLevelStats,
                ...stats
            };

            // Update time spent if provided
            if (timeSpent !== undefined) {
                newLevelStats.totalTimeSpent += timeSpent;
                // Update minimum time spent if this is a completed level and the time is less than the current minimum
                if (isCompleted && (currentLevelStats.minTimeSpent === Number.MAX_SAFE_INTEGER || timeSpent < currentLevelStats.minTimeSpent)) {
                    newLevelStats.minTimeSpent = timeSpent;
                }
            }

            // Update hints used if provided
            if (hintsUsed !== undefined) {
                newLevelStats.totalHintsUsed += hintsUsed;
                // Update minimum hints used if this is a completed level and the hints used is less than the current minimum
                if (isCompleted && (currentLevelStats.minHintsUsed === Number.MAX_SAFE_INTEGER || hintsUsed < currentLevelStats.minHintsUsed)) {
                    newLevelStats.minHintsUsed = hintsUsed;
                }
            }

            // Update mistakes made if provided
            if (mistakesMade !== undefined) {
                newLevelStats.totalMistakesMade += mistakesMade;
                // Update minimum mistakes made if this is a completed level and the mistakes made is less than the current minimum
                if (isCompleted && (currentLevelStats.minMistakesMade === Number.MAX_SAFE_INTEGER || mistakesMade < currentLevelStats.minMistakesMade)) {
                    newLevelStats.minMistakesMade = mistakesMade;
                }
            }

            // Update times completed if isCompleted is true
            if (isCompleted) {
                newLevelStats.timesCompleted += 1;
            }

            // Calculate new summary stats
            const newSummary = {...state.summary};

            // Update summary time spent if provided
            if (timeSpent !== undefined) {
                newSummary.totalTimeSpent += timeSpent;
            }

            // Update summary hints used if provided
            if (hintsUsed !== undefined) {
                newSummary.totalHintsUsed += hintsUsed;
            }

            // Update summary mistakes made if provided
            if (mistakesMade !== undefined) {
                newSummary.totalMistakesMade += mistakesMade;
            }

            // Update summary level completions if isCompleted is true
            if (isCompleted) {
                newSummary.totalLevelCompletions += 1;

                // If this is the first time completing this level, increment totalLevelsSolved
                if (currentLevelStats.timesCompleted === 0) {
                    newSummary.totalLevelsSolved += 1;
                }
            }

            return {
                summary: newSummary,
                levels: {
                    ...state.levels,
                    [levelKey]: newLevelStats
                }
            };
        }

        case SET_PLAYER_STATS: {
            return action.payload.playerStats;
        }

        case RESET_PROGRESS: {
            return createDefaultPlayerStats();
        }

        default:
            return state;
    }
}