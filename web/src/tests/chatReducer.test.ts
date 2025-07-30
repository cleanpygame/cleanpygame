import { describe, expect, test } from 'vitest';
import { chatReducer, getInstructionChatMessage } from '../reducers/chatReducer';
import { loadLevel, loadCommunityLevel } from '../reducers/actionCreators';
import { LevelData, LevelId } from '../types';

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
        }
    ],
    startMessage: 'This is a custom start message'
};

// Mock level data without a custom start message
const mockLevelDataNoCustomMessage: LevelData = {
    filename: 'test_level2.py',
    blocks: [
        {
            type: 'code',
            text: 'x = 5',
            clickable: 'x',
            replacement: 'count',
            event: 'rename_variable',
            explanation: 'Use descriptive variable names',
            hint: 'The variable name should describe what it stores'
        }
    ]
};

describe('Chat Reducer', () => {
    test('getInstructionChatMessage returns correct message with custom startMessage', () => {
        const message = getInstructionChatMessage(mockLevelData);
        expect(message.type).toBe('buddy-instruct');
        expect(message.text).toBe('This is a custom start message');
    });

    test('getInstructionChatMessage returns default message when no startMessage is provided', () => {
        const message = getInstructionChatMessage(mockLevelDataNoCustomMessage);
        expect(message.type).toBe('buddy-instruct');
        expect(message.text).toBe('Find and fix all the issues in this code.');
    });

    test('LOAD_LEVEL action sets initial chat message', () => {
        // Create a mock level ID
        const levelId: LevelId = {
            topic: 'test-topic',
            levelId: 'test_level.py'
        };

        // Create the action
        const action = loadLevel(levelId);

        // Create a mock full state with the current level
        const fullState = {
            currentLevel: {
                level: mockLevelData,
                triggeredEvents: [],
                pendingHintId: null,
                code: 'def test_function():',
                isFinished: false,
                regions: [],
                startTime: Date.now(),
                sessionHintsUsed: 0,
                sessionMistakesMade: 0
            }
        };

        // Call the reducer
        const newState = chatReducer([], action, fullState);

        // Verify the result
        expect(newState.length).toBe(1);
        expect(newState[0].type).toBe('buddy-instruct');
        expect(newState[0].text).toBe('This is a custom start message');
    });

    test('LOAD_COMMUNITY_LEVEL action sets initial chat message', () => {
        // Create the action
        const action = loadCommunityLevel('community-level-id', mockLevelData);

        // Call the reducer
        const newState = chatReducer([], action);

        // Verify the result
        expect(newState.length).toBe(1);
        expect(newState[0].type).toBe('buddy-instruct');
        expect(newState[0].text).toBe('This is a custom start message');
    });

    test('LOAD_COMMUNITY_LEVEL action sets default message when no startMessage is provided', () => {
        // Create the action
        const action = loadCommunityLevel('community-level-id', mockLevelDataNoCustomMessage);

        // Call the reducer
        const newState = chatReducer([], action);

        // Verify the result
        expect(newState.length).toBe(1);
        expect(newState[0].type).toBe('buddy-instruct');
        expect(newState[0].text).toBe('Find and fix all the issues in this code.');
    });
});