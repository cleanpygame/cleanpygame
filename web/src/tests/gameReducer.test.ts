import {describe, expect, test, vi} from 'vitest';
import {gameReducer, initialState} from '../reducers';
import {applyFix, getHint, wrongClick} from '../reducers/actionCreators';
import {GameState} from '../types';
import {getCurrentLevelKey} from '../utils/levelUtils';

// Mock Date.now for consistent testing
const mockDateNow = 1627776000000; // Fixed timestamp for testing
vi.spyOn(Date, 'now').mockImplementation(() => mockDateNow);

describe('Game Reducer - Statistics Integration', () => {
    test('APPLY_FIX updates player statistics when level is completed', () => {
        let state: GameState = {
            ...initialState,
            // Set up a level with only one issue to fix
            currentLevel: {
                ...initialState.currentLevel,
                level: {
                    ...initialState.currentLevel.level,
                    blocks: [
                        {
                            type: 'code',
                            text: 'def test_function():',
                            clickable: 'test_function',
                            replacement: 'better_function_name',
                            event: 'rename_function',
                            explanation: 'Use descriptive function names'
                        }
                    ]
                },
                startTime: mockDateNow - 30000, // 30 seconds ago
                sessionHintsUsed: 2,
                sessionMistakesMade: 3
            }
        };

        // Apply the fix to complete the level
        state = gameReducer(state, applyFix('rename_function'));

        // Get level key for the current level
        const levelKey = getCurrentLevelKey(state);

        // Check that the level is completed
        expect(state.currentLevel.isFinished).toBe(true);

        // Check that player statistics are updated
        expect(state.playerStats.levels[levelKey]).toBeDefined();
        expect(state.playerStats.levels[levelKey].timesCompleted).toBe(1);
        expect(state.playerStats.levels[levelKey].totalTimeSpent).toBe(30); // 30 seconds
        expect(state.playerStats.levels[levelKey].totalHintsUsed).toBe(2);
        expect(state.playerStats.levels[levelKey].totalMistakesMade).toBe(3);
        expect(state.playerStats.levels[levelKey].minTimeSpent).toBe(30);
        expect(state.playerStats.levels[levelKey].minHintsUsed).toBe(2);
        expect(state.playerStats.levels[levelKey].minMistakesMade).toBe(3);

        // Check that summary statistics are updated
        expect(state.playerStats.summary.totalTimeSpent).toBe(30);
        expect(state.playerStats.summary.totalLevelsSolved).toBe(1);
        expect(state.playerStats.summary.totalLevelCompletions).toBe(1);
        expect(state.playerStats.summary.totalHintsUsed).toBe(2);
        expect(state.playerStats.summary.totalMistakesMade).toBe(3);
    });

    test('APPLY_FIX does not update completion statistics when level is not completed', () => {
        let state: GameState = {
            ...initialState,
            // Set up a level with two issues to fix
            currentLevel: {
                ...initialState.currentLevel,
                level: {
                    ...initialState.currentLevel.level,
                    blocks: [
                        {
                            type: 'code',
                            text: 'def test_function():',
                            clickable: 'test_function',
                            replacement: 'better_function_name',
                            event: 'rename_function',
                            explanation: 'Use descriptive function names'
                        },
                        {
                            type: 'code',
                            text: '    x = 5',
                            clickable: 'x',
                            replacement: 'count',
                            event: 'rename_variable',
                            explanation: 'Use descriptive variable names'
                        }
                    ]
                },
                startTime: mockDateNow - 30000, // 30 seconds ago
                sessionHintsUsed: 1,
                sessionMistakesMade: 2
            }
        };

        // Apply one fix but not the other
        state = gameReducer(state, applyFix('rename_function'));

        // Get level key for the current level
        const levelKey = getCurrentLevelKey(state);

        // Check that the level is not completed
        expect(state.currentLevel.isFinished).toBe(false);

        // Check that player statistics exist but completion stats are not updated
        expect(state.playerStats.levels[levelKey]).toBeDefined();
        expect(state.playerStats.levels[levelKey].timesCompleted).toBe(0);
        expect(state.playerStats.summary.totalLevelCompletions).toBe(0);
        expect(state.playerStats.summary.totalLevelsSolved).toBe(0);
    });

    test('GET_HINT updates hint statistics', () => {
        let state: GameState = initialState;

        // Use a hint
        state = gameReducer(state, getHint());

        // Get level key for the current level
        const levelKey = getCurrentLevelKey(state);

        // Check that hint statistics are updated
        expect(state.playerStats.levels[levelKey]).toBeDefined();
        expect(state.playerStats.levels[levelKey].totalHintsUsed).toBe(1);
        expect(state.playerStats.summary.totalHintsUsed).toBe(1);

        // Use another hint
        state = gameReducer(state, getHint());

        // Check that hint statistics are incremented
        expect(state.playerStats.levels[levelKey].totalHintsUsed).toBe(2);
        expect(state.playerStats.summary.totalHintsUsed).toBe(2);
    });

    test('WRONG_CLICK updates mistake statistics', () => {
        let state: GameState = initialState;

        // Make a wrong click
        state = gameReducer(state, wrongClick(0, 0, 'wrong'));

        // Get level key for the current level
        const levelKey = getCurrentLevelKey(state);

        // Check that mistake statistics are updated
        expect(state.playerStats.levels[levelKey]).toBeDefined();
        expect(state.playerStats.levels[levelKey].totalMistakesMade).toBe(1);
        expect(state.playerStats.summary.totalMistakesMade).toBe(1);

        // Make another wrong click
        state = gameReducer(state, wrongClick(0, 0, 'another_wrong'));

        // Check that mistake statistics are incremented
        expect(state.playerStats.levels[levelKey].totalMistakesMade).toBe(2);
        expect(state.playerStats.summary.totalMistakesMade).toBe(2);
    });

    test('Complete level with multiple actions updates statistics correctly', () => {
        let state: GameState = {
            ...initialState,
            // Set up a level with only one issue to fix
            currentLevel: {
                ...initialState.currentLevel,
                level: {
                    ...initialState.currentLevel.level,
                    blocks: [
                        {
                            type: 'code',
                            text: 'def test_function():',
                            clickable: 'test_function',
                            replacement: 'better_function_name',
                            event: 'rename_function',
                            explanation: 'Use descriptive function names'
                        }
                    ]
                },
                startTime: mockDateNow - 60000, // 60 seconds ago
                sessionHintsUsed: 0,
                sessionMistakesMade: 0
            }
        };

        // Make some wrong clicks
        state = gameReducer(state, wrongClick(0, 0, 'wrong1'));
        state = gameReducer(state, wrongClick(0, 0, 'wrong2'));

        // Use a hint
        state = gameReducer(state, getHint());

        // Apply the fix to complete the level
        state = gameReducer(state, applyFix('rename_function'));

        // Get level key for the current level
        const levelKey = getCurrentLevelKey(state);

        // Check that the level is completed
        expect(state.currentLevel.isFinished).toBe(true);

        // Check that player statistics are updated correctly
        expect(state.playerStats.levels[levelKey].timesCompleted).toBe(1);
        expect(state.playerStats.levels[levelKey].totalTimeSpent).toBe(60);

        // The levelReducer increments sessionHintsUsed and sessionMistakesMade
        // which are then passed to the statsReducer when the level is completed
        expect(state.currentLevel.sessionHintsUsed).toBe(1);
        expect(state.currentLevel.sessionMistakesMade).toBe(2);

        // Check that statistics exist
        expect(state.playerStats.levels[levelKey].totalHintsUsed).toBeGreaterThan(0);
        expect(state.playerStats.levels[levelKey].totalMistakesMade).toBeGreaterThan(0);
        expect(state.playerStats.levels[levelKey].minHintsUsed).toBeGreaterThan(0);
        expect(state.playerStats.levels[levelKey].minMistakesMade).toBeGreaterThan(0);

        // Check that summary statistics are updated correctly
        expect(state.playerStats.summary.totalTimeSpent).toBe(60);
        expect(state.playerStats.summary.totalLevelsSolved).toBe(1);
        expect(state.playerStats.summary.totalLevelCompletions).toBe(1);
        expect(state.playerStats.summary.totalHintsUsed).toBeGreaterThan(0);
        expect(state.playerStats.summary.totalMistakesMade).toBeGreaterThan(0);
    });
});