import {describe, expect, test} from 'vitest';
import {
    APPLY_FIX,
    CODE_CLICK,
    gameReducer,
    GET_HINT,
    initialState,
    LOAD_LEVEL,
    NEXT_LEVEL,
    POST_BUDDY_MESSAGE,
    RESET_PROGRESS,
    TOGGLE_NOTEBOOK,
    WRONG_CLICK
} from '../reducer';
import {GameState, LevelId} from '../types';

describe('Game Reducer', () => {
    test('all levels can be solved one by one', () => {
        let state: GameState = initialState;
        const solvedLevels: string[] = [];
        const maxIterations = 10; // Safety limit to prevent infinite loops
        let iterations = 0;

        while (iterations < maxIterations && state.currentLevel) {
            iterations++;
            const currentLevelId = `${state.currentLevelId.topic}/${state.currentLevelId.levelId}`;
            if (solvedLevels.includes(currentLevelId)) break;

            const eventsToTrigger = state.currentLevel.level.blocks
                .filter(block => block.event && block.type !== 'neutral')
                .map(block => block.event as string);

            for (const eventId of eventsToTrigger) {
                expect(state.currentLevel.isFinished).toBe(false);
                const region = state.currentLevel.regions?.find(r => r.eventId === eventId);

                if (region) {
                    state = gameReducer(state, {
                        type: CODE_CLICK,
                        payload: {
                            lineIndex: region.startLine,
                            colIndex: region.startCol,
                            token: eventId
                        }
                    });

                    expect(state.currentLevel.triggeredEvents).toContain(eventId);
                }
            }

            expect(state.solvedLevels.some(level =>
                level.topic === state.currentLevelId.topic &&
                level.levelId === state.currentLevelId.levelId
            )).toBe(true);

            solvedLevels.push(currentLevelId);

            state = gameReducer(state, {type: NEXT_LEVEL});
        }

        expect(solvedLevels.length).toBeGreaterThan(0);
        console.log('Solved levels:', solvedLevels);
    });

    test('LOAD_LEVEL transition loads the specified level', () => {
        let state: GameState = initialState;

        // Get a different level to load - use the second topic's first level
        if (state.topics.length > 1 && state.topics[1].levels.length > 0) {
            const secondTopic = state.topics[1];
            const secondTopicLevel = secondTopic.levels[0];

            const levelId: LevelId = {
                topic: secondTopic.name,
                levelId: secondTopicLevel.filename
            };

            // Load the level
            state = gameReducer(state, {
                type: LOAD_LEVEL,
                payload: {levelId}
            });

            // Verify the level was loaded
            expect(state.currentLevelId.topic).toBe(levelId.topic);
            expect(state.currentLevelId.levelId).toBe(levelId.levelId);

            // Verify chat messages were updated
            expect(state.chatMessages.length).toBeGreaterThan(0);
        } else {
            // Skip test if we don't have enough levels
            console.log('Skipping LOAD_LEVEL test - not enough levels available');
        }
    });

    test('WRONG_CLICK transition adds messages to chat', () => {
        let state: GameState = initialState;
        const initialChatLength = state.chatMessages.length;

        // Simulate a wrong click
        state = gameReducer(state, {
            type: WRONG_CLICK,
            payload: {
                lineIndex: 0,
                colIndex: 0,
                token: 'not-an-issue'
            }
        });

        // Verify chat messages were added
        expect(state.chatMessages.length).toBe(initialChatLength + 2); // Me message + buddy reject message
        expect(state.chatMessages[initialChatLength].type).toBe('me');
        expect(state.chatMessages[initialChatLength + 1].type).toBe('buddy-reject');
    });

    test('GET_HINT transition adds a hint message to chat', () => {
        let state: GameState = initialState;
        const initialChatLength = state.chatMessages.length;

        expect(state.currentLevel.pendingHintId).toBeTruthy();

        state = gameReducer(state, {type: GET_HINT});

        // Verify a hint message was added
        expect(state.chatMessages.length).toBe(initialChatLength + 1);
        expect(state.chatMessages[initialChatLength].type).toBe('buddy-help');
        expect(state.currentLevel.pendingHintId).toBeNull();
    });

    test('POST_BUDDY_MESSAGE transition adds a message to chat', () => {
        let state: GameState = initialState;
        const initialChatLength = state.chatMessages.length;
        const testMessage = {type: 'buddy-test' as any, text: 'Test message'};

        // Post a message
        state = gameReducer(state, {
            type: POST_BUDDY_MESSAGE,
            payload: {message: testMessage}
        });

        // Verify the message was added
        expect(state.chatMessages.length).toBe(initialChatLength + 1);
        expect(state.chatMessages[initialChatLength]).toEqual(testMessage);
    });

    test('RESET_PROGRESS transition resets the game state', () => {
        let state: GameState = initialState;

        // First, solve a level to change the state
        const region = state.currentLevel.regions?.[0];
        if (region) {
            state = gameReducer(state, {
                type: CODE_CLICK,
                payload: {
                    lineIndex: region.startLine,
                    colIndex: region.startCol,
                    token: region.eventId || ''
                }
            });
        }

        // Then reset progress
        state = gameReducer(state, {type: RESET_PROGRESS});

        // Verify the state was reset
        expect(state.solvedLevels).toEqual([]);
        expect(state.currentLevelId).toEqual(initialState.currentLevelId);
        expect(state.currentLevel.triggeredEvents).toEqual([]);
    });

    test('TOGGLE_NOTEBOOK transition toggles notebook state', () => {
        let state: GameState = initialState;
        const initialNotebookState = state.notebookOpen;

        // Toggle the notebook (should open it)
        state = gameReducer(state, {type: TOGGLE_NOTEBOOK});
        expect(state.notebookOpen).toBe(!initialNotebookState);

        // Toggle the notebook again (should close it)
        state = gameReducer(state, {type: TOGGLE_NOTEBOOK});
        expect(state.notebookOpen).toBe(initialNotebookState);
    });

    test('APPLY_FIX transition directly applies a fix', () => {
        let state: GameState = initialState;

        // Find an event to trigger
        const eventToTrigger = state.currentLevel.level.blocks
            .find(block => block.event && block.type !== 'neutral')?.event;

        if (eventToTrigger) {
            const region = state.currentLevel.regions?.find(r => r.eventId === eventToTrigger);

            if (region) {
                // Apply the fix directly
                state = gameReducer(state, {
                    type: APPLY_FIX,
                    payload: {
                        eventId: eventToTrigger,
                        lineIndex: region.startLine,
                        colIndex: region.startCol,
                        token: 'test-token'
                    }
                });

                // Verify the event was triggered
                expect(state.currentLevel.triggeredEvents).toContain(eventToTrigger);

                // Verify chat messages were added
                expect(state.chatMessages.length).toBeGreaterThan(1);
                expect(state.chatMessages[state.chatMessages.length - 2].type).toBe('me');
                expect(state.chatMessages[state.chatMessages.length - 1].type).toBe('buddy-explain');
            }
        }
    });
});