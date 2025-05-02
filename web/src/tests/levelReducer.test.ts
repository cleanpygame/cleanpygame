import {describe, expect, test} from 'vitest';
import {levelReducer} from '../reducers/levelReducer';
import {applyFix, getHint, loadLevel} from '../reducers/actionCreators';
import {LevelData, LevelId} from '../types';

describe('Level Reducer', () => {
    // Mock data
    const mockLevelData: LevelData = {
        filename: 'test-level',
        wisdoms: ['wisdom1'],
        blocks: [
            {
                type: 'issue',
                text: 'This is an issue',
                event: 'event1',
                explanation: 'This is an explanation',
                hint: 'This is a hint'
            },
            {
                type: 'neutral',
                text: 'This is neutral'
            }
        ],
        startMessage: 'Start message'
    };

    const mockTopics = [
        {
            name: 'test-topic',
            wisdoms: [{id: 'wisdom1', text: 'Wisdom text'}],
            levels: [mockLevelData]
        }
    ];

    const mockLevelId: LevelId = {
        topic: 'test-topic',
        levelId: 'test-level'
    };

    test('LOAD_LEVEL creates initial level state', () => {
        const action = loadLevel(mockLevelId);
        const result = levelReducer(null, action, mockTopics);

        expect(result).not.toBeNull();
        if (result) {
            expect(result.level).toEqual(mockLevelData);
            expect(result.triggeredEvents).toEqual([]);
            expect(result.pendingHintId).toBe('event1'); // First event with a hint
            expect(result.isFinished).toBe(false);
        }
    });

    test('APPLY_FIX updates triggered events and checks if level is finished', () => {
        // First create an initial state
        const initialState = levelReducer(null, loadLevel(mockLevelId), mockTopics);

        // Then apply a fix
        const action = applyFix('event1');
        const result = levelReducer(initialState, action);

        expect(result).not.toBeNull();
        if (result) {
            expect(result.triggeredEvents).toContain('event1');
            expect(result.isFinished).toBe(true); // All issues fixed
        }
    });

    test('GET_HINT clears pending hint ID', () => {
        // First create an initial state
        const initialState = levelReducer(null, loadLevel(mockLevelId), mockTopics);

        // Verify there's a pending hint
        expect(initialState?.pendingHintId).toBeTruthy();

        // Then get a hint
        const action = getHint();
        const result = levelReducer(initialState, action);

        expect(result).not.toBeNull();
        if (result) {
            expect(result.pendingHintId).toBeNull();
        }
    });
});