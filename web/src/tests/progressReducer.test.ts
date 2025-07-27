import {describe, expect, test} from 'vitest';
import {progressReducer} from '../reducers/progressReducer';
import {applyFix, nextLevel, resetProgress} from '../reducers/actionCreators';
import {LevelData, LevelState} from '../types';

describe('Progress Reducer', () => {
    test('APPLY_FIX no longer updates solvedLevels', () => {
        // Initial state with empty discoveredWisdoms
        const initialState = {discoveredWisdoms: []};

        // Mock level state
        const mockLevelState: LevelState = {
            level: {
                filename: 'test_level.py',
                wisdoms: ['test_wisdom'],
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
            } as LevelData,
            triggeredEvents: [],
            pendingHintId: null,
            code: '',
            isFinished: true, // Level is finished
            regions: [],
            startTime: Date.now(),
            sessionHintsUsed: 0,
            sessionMistakesMade: 0
        };

        // Apply fix action with a completed level
        const newState = progressReducer(
            initialState,
            applyFix('rename_function'),
            {
                currentLevel: mockLevelState,
                currentLevelId: {topic: 'test_topic', levelId: 'test_level.py'}
            }
        );

        // State should remain unchanged since solvedLevels are no longer tracked here
        expect(newState).toBe(initialState);
    });

    test('NEXT_LEVEL adds new wisdoms to discoveredWisdoms', () => {
        // Initial state with some discovered wisdoms
        const initialState = {discoveredWisdoms: ['existing_wisdom']};

        // Mock level state with new wisdoms
        const mockLevelState: LevelState = {
            level: {
                filename: 'test_level.py',
                wisdoms: ['new_wisdom1', 'new_wisdom2', 'existing_wisdom'],
                blocks: []
            } as LevelData,
            triggeredEvents: [],
            pendingHintId: null,
            code: '',
            isFinished: true,
            regions: [],
            startTime: Date.now(),
            sessionHintsUsed: 0,
            sessionMistakesMade: 0
        };

        // Next level action
        const newState = progressReducer(
            initialState,
            nextLevel(),
            {currentLevel: mockLevelState}
        );

        // Only new wisdoms should be added
        expect(newState.discoveredWisdoms).toContain('existing_wisdom');
        expect(newState.discoveredWisdoms).toContain('new_wisdom1');
        expect(newState.discoveredWisdoms).toContain('new_wisdom2');
        expect(newState.discoveredWisdoms.length).toBe(3);
    });

    test('NEXT_LEVEL returns unchanged state if no new wisdoms', () => {
        // Initial state with all wisdoms already discovered
        const initialState = {discoveredWisdoms: ['wisdom1', 'wisdom2']};

        // Mock level state with no new wisdoms
        const mockLevelState: LevelState = {
            level: {
                filename: 'test_level.py',
                wisdoms: ['wisdom1', 'wisdom2'],
                blocks: []
            } as LevelData,
            triggeredEvents: [],
            pendingHintId: null,
            code: '',
            isFinished: true,
            regions: [],
            startTime: Date.now(),
            sessionHintsUsed: 0,
            sessionMistakesMade: 0
        };

        // Next level action
        const newState = progressReducer(
            initialState,
            nextLevel(),
            {currentLevel: mockLevelState}
        );

        // State should remain unchanged
        expect(newState).toBe(initialState);
    });

    test('NEXT_LEVEL returns unchanged state if currentLevel is null', () => {
        // Initial state
        const initialState = {discoveredWisdoms: ['wisdom1']};

        // Next level action with null currentLevel
        const newState = progressReducer(
            initialState,
            nextLevel(),
            {currentLevel: null}
        );

        // State should remain unchanged
        expect(newState).toBe(initialState);
    });

    test('RESET_PROGRESS clears discoveredWisdoms', () => {
        // Initial state with some discovered wisdoms
        const initialState = {discoveredWisdoms: ['wisdom1', 'wisdom2', 'wisdom3']};

        // Reset progress action
        const newState = progressReducer(initialState, resetProgress());

        // discoveredWisdoms should be empty
        expect(newState.discoveredWisdoms).toEqual([]);
    });
});