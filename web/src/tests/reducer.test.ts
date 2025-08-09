import {describe, expect, test} from 'vitest';
import {gameReducer, initialState} from '../reducers';
import {
    applyFix,
    codeClick,
    getHint,
    loadLevel,
    postChatMessage,
    resetProgress,
    selectContextMenuItem,
    wrongClick
} from '../reducers/actionCreators';
import {GameState, LevelId} from '../types';
import {getCurrentLevelKey, getLevelKey} from '../utils/levelUtils';

describe('Game Reducer', () => {
    test('all levels can be solved one by one', () => {
        let state: GameState = initialState;
        const solvedLevels: string[] = [];
        // Compute the total number of levels from the initial state topics
        const allLevelKeys = initialState.topics.flatMap(t => t.levels.map(l => getLevelKey(t.name, l.filename)));
        const totalLevels = allLevelKeys.length;
        // Prepare a deterministic list of all levels to solve one by one
        const allLevelsToSolve = initialState.topics.flatMap(t => t.levels.map(l => ({
            topic: t.name,
            levelId: l.filename
        })));

        for (const levelId of allLevelsToSolve) {
            // Load the specific level
            state = gameReducer(state, loadLevel(levelId));

            const currentLevelKey = getCurrentLevelKey(state);

            const eventsToTrigger = state.currentLevel.level.blocks
                .filter(block => block.event && block.type !== 'neutral')
                .flatMap(block => Array.isArray(block.event) ? block.event : [block.event]) as string[];

            for (const eventId of eventsToTrigger) {
                const region = state.currentLevel.regions?.find(r => r.eventId === eventId);

                if (region) {
                    state = gameReducer(state, codeClick(
                        region.startLine,
                        region.startCol,
                        eventId
                    ));

                    // If a context menu opened, select the correct option to apply
                    if (state.optionsMenu?.visible && state.optionsMenu.options) {
                        const correct = state.optionsMenu.options.find(o => o.correct);
                        if (correct) {
                            state = gameReducer(state, selectContextMenuItem(correct.id));
                        }
                    }

                    expect(state.currentLevel.triggeredEvents).toContain(eventId);
                }
            }

            // Check if the level exists in playerStats.levels and has been completed at least once
            expect(state.playerStats.levels[currentLevelKey]?.timesCompleted).toBeGreaterThan(0);

            solvedLevels.push(`${levelId.topic}/${levelId.levelId}`);
        }

        console.log('Solved levels:', solvedLevels);
        expect(solvedLevels.length).toBe(totalLevels);
        // Verify every level has been completed at least once
        for (const key of allLevelKeys) {
            expect(state.playerStats.levels[key]?.timesCompleted).toBeGreaterThan(0);
        }
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
            state = gameReducer(state, loadLevel(levelId));

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
        state = gameReducer(state, wrongClick(0, 0, 'not-an-issue'));

        // Verify chat messages were added
        expect(state.chatMessages.length).toBe(initialChatLength + 2); // Me message + buddy reject message
        expect(state.chatMessages[initialChatLength].type).toBe('me');
        expect(state.chatMessages[initialChatLength + 1].type).toBe('buddy-reject');
    });

    test('GET_HINT transition adds a hint message to chat', () => {
        let state: GameState = initialState;
        const initialChatLength = state.chatMessages.length;

        expect(state.currentLevel.pendingHintId).toBeTruthy();

        state = gameReducer(state, getHint());

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
        state = gameReducer(state, postChatMessage(testMessage));

        // Verify the message was added
        expect(state.chatMessages.length).toBe(initialChatLength + 1);
        expect(state.chatMessages[initialChatLength]).toEqual(testMessage);
    });

    test('RESET_PROGRESS transition resets the game state but preserves auth state', () => {
        let state: GameState = initialState;

        // Set up a mock auth state
        state = {
            ...state,
            auth: {
                user: {uid: 'test-uid', displayName: 'Test User', email: 'test@example.com', photoURL: null},
                isAuthenticated: true,
                isLoading: false,
                error: null,
                isAdmin: false,
                isAnonymous: false
            }
        };

        // First, solve a level to change the state
        const region = state.currentLevel.regions?.[0];
        if (region) {
            state = gameReducer(state, codeClick(
                region.startLine,
                region.startCol,
                region.eventId || ''
            ));
        }

        // Then reset progress
        state = gameReducer(state, resetProgress());

        // Verify the state was reset
        expect(state.playerStats.levels).toEqual({});
        expect(state.currentLevelId).toEqual(initialState.currentLevelId);
        expect(state.currentLevel.triggeredEvents).toEqual([]);

        // Verify auth state is preserved
        expect(state.auth.isAuthenticated).toBe(true);
        expect(state.auth.user).toBeTruthy();
        expect(state.auth.user?.uid).toBe('test-uid');
    });


    test('APPLY_FIX transition directly applies a fix', () => {
        let state: GameState = initialState;

        // Find an event to trigger
        const eventToTrigger = state.currentLevel.level.blocks
            .find(block => block.event && block.type !== 'neutral')?.event;

        if (eventToTrigger) {
            const region = state.currentLevel.regions?.find(r => r.eventId === eventToTrigger);

            if (region) {
                // Get the event ID as a string (use the first element if it's an array)
                const eventId = Array.isArray(eventToTrigger) ? eventToTrigger[0] : eventToTrigger;
                
                // Apply the fix directly
                state = gameReducer(state, applyFix(eventId));

                // Verify the event was triggered
                expect(state.currentLevel.triggeredEvents).toContain(eventId);

                // Verify chat messages were added
                expect(state.chatMessages.length).toBeGreaterThan(1);
                expect(state.chatMessages[state.chatMessages.length - 2].type).toBe('buddy-explain');
                expect(state.chatMessages[state.chatMessages.length - 1].type).toBe('buddy-summarize');
            }
        }
    });
});
