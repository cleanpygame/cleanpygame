import {describe, expect, test, vi} from 'vitest';
import {createInitialLevelState, levelReducer} from '../reducers/levelReducer';
import {applyFix, getHint, wrongClick} from '../reducers/actionCreators';
import {LevelData} from '../types';

// Mock Date.now for consistent testing
const mockDateNow = 1627776000000; // Fixed timestamp for testing
vi.spyOn(Date, 'now').mockImplementation(() => mockDateNow);

// Mock level data for testing
const mockLevelData: LevelData = {
    filename: 'test_level.py',
    blocks: [
        {
            type: 'code',
            text: 'def test_function():',
            clickable: 'test_function',
            replacement: 'better_function_name',
            event: 'rename_function',
            explanation: 'Use descriptive function names',
            hint: 'The function name should describe what it does'
        },
        {
            type: 'code',
            text: '    x = 5',
            clickable: 'x',
            replacement: 'count',
            event: 'rename_variable',
            explanation: 'Use descriptive variable names',
            hint: 'The variable name should describe what it stores'
        }
    ]
};

describe('Level Reducer', () => {
    test('createInitialLevelState initializes session tracking fields', () => {
        const initialState = createInitialLevelState(mockLevelData);

        // Check that session tracking fields are initialized
        expect(initialState.startTime).toBe(mockDateNow);
        expect(initialState.sessionHintsUsed).toBe(0);
        expect(initialState.sessionMistakesMade).toBe(0);

        // Check other fields are also initialized correctly
        expect(initialState.level).toBe(mockLevelData);
        expect(initialState.triggeredEvents).toEqual([]);
        expect(initialState.isFinished).toBe(false);
        expect(initialState.pendingHintId).toBe('rename_function'); // First event with a hint
    });

    test('GET_HINT increments sessionHintsUsed', () => {
        // Create initial state
        const initialState = createInitialLevelState(mockLevelData);

        // Apply GET_HINT action
        const newState = levelReducer(initialState, getHint());

        // Check that sessionHintsUsed is incremented
        expect(newState?.sessionHintsUsed).toBe(1);

        // Apply another GET_HINT action
        const newerState = levelReducer(newState, getHint());

        // Check that sessionHintsUsed is incremented again
        expect(newerState?.sessionHintsUsed).toBe(2);
    });

    test('WRONG_CLICK increments sessionMistakesMade', () => {
        // Create initial state
        const initialState = createInitialLevelState(mockLevelData);

        // Apply WRONG_CLICK action
        const newState = levelReducer(initialState, wrongClick(0, 0, 'wrong'));

        // Check that sessionMistakesMade is incremented
        expect(newState?.sessionMistakesMade).toBe(1);

        // Apply another WRONG_CLICK action
        const newerState = levelReducer(newState, wrongClick(0, 0, 'another_wrong'));

        // Check that sessionMistakesMade is incremented again
        expect(newerState?.sessionMistakesMade).toBe(2);
    });

    test('APPLY_FIX does not affect session tracking fields', () => {
        // Create initial state
        const initialState = createInitialLevelState(mockLevelData);

        // Apply APPLY_FIX action
        const newState = levelReducer(initialState, applyFix('rename_function'));

        // Check that session tracking fields are unchanged
        expect(newState?.sessionHintsUsed).toBe(0);
        expect(newState?.sessionMistakesMade).toBe(0);

        // Check that other fields are updated correctly
        expect(newState?.triggeredEvents).toContain('rename_function');
    });

    test('Multiple actions correctly track session statistics', () => {
        // Create initial state
        const initialState = createInitialLevelState(mockLevelData);

        // Apply a sequence of actions
        let state = levelReducer(initialState, wrongClick(0, 0, 'wrong1'));
        state = levelReducer(state, wrongClick(0, 0, 'wrong2'));
        state = levelReducer(state, getHint());
        state = levelReducer(state, applyFix('rename_function'));
        state = levelReducer(state, wrongClick(0, 0, 'wrong3'));
        state = levelReducer(state, getHint());
        state = levelReducer(state, applyFix('rename_variable'));

        // Check final session tracking values
        expect(state?.sessionHintsUsed).toBe(2);
        expect(state?.sessionMistakesMade).toBe(3);

        // Check that the level is finished
        expect(state?.isFinished).toBe(true);
    });
});