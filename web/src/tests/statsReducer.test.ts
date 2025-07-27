import {describe, expect, test} from 'vitest';
import {createDefaultLevelStats, createDefaultPlayerStats, statsReducer} from '../reducers/statsReducer';
import {resetProgress, setPlayerStats, updateLevelStats} from '../reducers/actionCreators';
import {PlayerStatsState} from '../types';

describe('Stats Reducer', () => {
    test('createDefaultLevelStats returns correct default values', () => {
        const defaultStats = createDefaultLevelStats();

        expect(defaultStats.timesCompleted).toBe(0);
        expect(defaultStats.totalTimeSpent).toBe(0);
        expect(defaultStats.totalHintsUsed).toBe(0);
        expect(defaultStats.totalMistakesMade).toBe(0);
        expect(defaultStats.minTimeSpent).toBe(Number.MAX_SAFE_INTEGER);
        expect(defaultStats.minHintsUsed).toBe(Number.MAX_SAFE_INTEGER);
        expect(defaultStats.minMistakesMade).toBe(Number.MAX_SAFE_INTEGER);
    });

    test('createDefaultPlayerStats returns correct default values', () => {
        const defaultStats = createDefaultPlayerStats();

        expect(defaultStats.summary.totalTimeSpent).toBe(0);
        expect(defaultStats.summary.totalLevelsSolved).toBe(0);
        expect(defaultStats.summary.totalLevelCompletions).toBe(0);
        expect(defaultStats.summary.totalHintsUsed).toBe(0);
        expect(defaultStats.summary.totalMistakesMade).toBe(0);
        expect(defaultStats.levels).toEqual({});
    });

    test('UPDATE_LEVEL_STATS creates new level stats for first completion', () => {
        const initialState = createDefaultPlayerStats();
        const levelKey = 'topic1__level1';

        const newState = statsReducer(
            initialState,
            updateLevelStats(
                levelKey,
                {},
                60, // timeSpent
                true, // isCompleted
                2, // hintsUsed
                3 // mistakesMade
            )
        );

        // Check level stats
        expect(newState.levels[levelKey]).toBeDefined();
        expect(newState.levels[levelKey].timesCompleted).toBe(1);
        expect(newState.levels[levelKey].totalTimeSpent).toBe(60);
        expect(newState.levels[levelKey].totalHintsUsed).toBe(2);
        expect(newState.levels[levelKey].totalMistakesMade).toBe(3);
        expect(newState.levels[levelKey].minTimeSpent).toBe(60);
        expect(newState.levels[levelKey].minHintsUsed).toBe(2);
        expect(newState.levels[levelKey].minMistakesMade).toBe(3);

        // Check summary stats
        expect(newState.summary.totalTimeSpent).toBe(60);
        expect(newState.summary.totalLevelsSolved).toBe(1);
        expect(newState.summary.totalLevelCompletions).toBe(1);
        expect(newState.summary.totalHintsUsed).toBe(2);
        expect(newState.summary.totalMistakesMade).toBe(3);
    });

    test('UPDATE_LEVEL_STATS updates existing level stats for subsequent completion', () => {
        // Start with a state that already has stats for a level
        const initialState: PlayerStatsState = {
            summary: {
                totalTimeSpent: 60,
                totalLevelsSolved: 1,
                totalLevelCompletions: 1,
                totalHintsUsed: 2,
                totalMistakesMade: 3
            },
            levels: {
                'topic1__level1': {
                    timesCompleted: 1,
                    totalTimeSpent: 60,
                    totalHintsUsed: 2,
                    totalMistakesMade: 3,
                    minTimeSpent: 60,
                    minHintsUsed: 2,
                    minMistakesMade: 3
                }
            }
        };

        const levelKey = 'topic1__level1';

        // Complete the same level again with different stats
        const newState = statsReducer(
            initialState,
            updateLevelStats(
                levelKey,
                {},
                45, // timeSpent - faster this time
                true, // isCompleted
                1, // hintsUsed - fewer this time
                2 // mistakesMade - fewer this time
            )
        );

        // Check level stats
        expect(newState.levels[levelKey].timesCompleted).toBe(2); // Incremented
        expect(newState.levels[levelKey].totalTimeSpent).toBe(105); // 60 + 45
        expect(newState.levels[levelKey].totalHintsUsed).toBe(3); // 2 + 1
        expect(newState.levels[levelKey].totalMistakesMade).toBe(5); // 3 + 2
        expect(newState.levels[levelKey].minTimeSpent).toBe(45); // Updated to lower value
        expect(newState.levels[levelKey].minHintsUsed).toBe(1); // Updated to lower value
        expect(newState.levels[levelKey].minMistakesMade).toBe(2); // Updated to lower value

        // Check summary stats
        expect(newState.summary.totalTimeSpent).toBe(105); // 60 + 45
        expect(newState.summary.totalLevelsSolved).toBe(1); // No change, same level
        expect(newState.summary.totalLevelCompletions).toBe(2); // Incremented
        expect(newState.summary.totalHintsUsed).toBe(3); // 2 + 1
        expect(newState.summary.totalMistakesMade).toBe(5); // 3 + 2
    });

    test('UPDATE_LEVEL_STATS handles hints and mistakes without completion', () => {
        const initialState = createDefaultPlayerStats();
        const levelKey = 'topic1__level1';

        // Add hints without completing the level
        const stateWithHints = statsReducer(
            initialState,
            updateLevelStats(
                levelKey,
                {},
                undefined, // timeSpent - not provided
                false, // isCompleted - not completed
                1, // hintsUsed
                0 // mistakesMade
            )
        );

        // Check level stats
        expect(stateWithHints.levels[levelKey]).toBeDefined();
        expect(stateWithHints.levels[levelKey].timesCompleted).toBe(0); // Not completed
        expect(stateWithHints.levels[levelKey].totalHintsUsed).toBe(1);
        expect(stateWithHints.levels[levelKey].minHintsUsed).toBe(Number.MAX_SAFE_INTEGER); // Not updated without completion

        // Check summary stats
        expect(stateWithHints.summary.totalLevelCompletions).toBe(0); // Not completed
        expect(stateWithHints.summary.totalHintsUsed).toBe(1);

        // Add mistakes without completing the level
        const stateWithMistakes = statsReducer(
            stateWithHints,
            updateLevelStats(
                levelKey,
                {},
                undefined, // timeSpent - not provided
                false, // isCompleted - not completed
                0, // hintsUsed
                1 // mistakesMade
            )
        );

        // Check level stats
        expect(stateWithMistakes.levels[levelKey].totalMistakesMade).toBe(1);
        expect(stateWithMistakes.levels[levelKey].minMistakesMade).toBe(Number.MAX_SAFE_INTEGER); // Not updated without completion

        // Check summary stats
        expect(stateWithMistakes.summary.totalMistakesMade).toBe(1);
    });

    test('SET_PLAYER_STATS replaces the entire state', () => {
        const initialState = createDefaultPlayerStats();

        const newStats: PlayerStatsState = {
            summary: {
                totalTimeSpent: 120,
                totalLevelsSolved: 2,
                totalLevelCompletions: 3,
                totalHintsUsed: 5,
                totalMistakesMade: 7
            },
            levels: {
                'topic1__level1': {
                    timesCompleted: 2,
                    totalTimeSpent: 80,
                    totalHintsUsed: 3,
                    totalMistakesMade: 4,
                    minTimeSpent: 35,
                    minHintsUsed: 1,
                    minMistakesMade: 1
                },
                'topic1__level2': {
                    timesCompleted: 1,
                    totalTimeSpent: 40,
                    totalHintsUsed: 2,
                    totalMistakesMade: 3,
                    minTimeSpent: 40,
                    minHintsUsed: 2,
                    minMistakesMade: 3
                }
            }
        };

        const newState = statsReducer(
            initialState,
            setPlayerStats(newStats)
        );

        // The entire state should be replaced
        expect(newState).toEqual(newStats);
    });

    test('RESET_PROGRESS resets to default state', () => {
        // Start with a non-empty state
        const initialState: PlayerStatsState = {
            summary: {
                totalTimeSpent: 120,
                totalLevelsSolved: 2,
                totalLevelCompletions: 3,
                totalHintsUsed: 5,
                totalMistakesMade: 7
            },
            levels: {
                'topic1__level1': {
                    timesCompleted: 2,
                    totalTimeSpent: 80,
                    totalHintsUsed: 3,
                    totalMistakesMade: 4,
                    minTimeSpent: 35,
                    minHintsUsed: 1,
                    minMistakesMade: 1
                }
            }
        };

        const newState = statsReducer(
            initialState,
            resetProgress()
        );

        // Should be reset to default values
        expect(newState).toEqual(createDefaultPlayerStats());
    });
});