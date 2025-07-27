import React, {createContext} from 'react';
import levelsData from '../data/levels.json';
import {GameState, LevelId, Topic} from '../types.ts';
import {applyFix, GameAction, loadLevel, wrongClick} from './actionCreators.ts';
import {
    APPLY_FIX,
    CODE_CLICK,
    GET_HINT,
    LOAD_LEVEL,
    LOGIN_FAILURE,
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGOUT,
    NEXT_LEVEL,
    POST_CHAT_MESSAGE,
    RESET_PROGRESS,
    SET_SOLVED_LEVELS,
    SET_TYPING_ANIMATION_COMPLETE,
    TOGGLE_NOTEBOOK,
    WRONG_CLICK
} from './actionTypes.ts';
import {createInitialLevelState, levelReducer} from './levelReducer.ts';
import {chatReducer, getInstructionChatMessage} from './chatReducer.ts';
import {progressReducer} from './progressReducer.ts';


let firstTopic = levelsData.topics[1]; // skip testing
// Initial state
let firstLevel = firstTopic.levels[0];
export const initialState: GameState = {
    topics: levelsData.topics as Topic[],
    currentLevelId: {topic: firstTopic.name, levelId: firstLevel.filename},
    currentLevel: createInitialLevelState(firstLevel),
    solvedLevels: [],
    discoveredWisdoms: [],
    notebookOpen: false,
    chatMessages: [getInstructionChatMessage(firstLevel)],
    isTypingAnimationComplete: true,
    auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
    }
};

/**
 * Find the next level ID in sequence
 * @param topics - All topics
 * @param currentLevelId - Current level ID
 * @returns Next level ID or null if no next level
 */
export const findNextLevelId = (topics: Topic[], currentLevelId: LevelId): LevelId | null => {
    const currentTopic = topics.find(t => t.name === currentLevelId.topic);

    if (!currentTopic) return null;

    // Find the current level index
    const currentLevelIndex = currentTopic.levels.findIndex(l => l.filename === currentLevelId.levelId);

    // If there's a next level in the same topic
    if (currentLevelIndex < currentTopic.levels.length - 1) {
        return {
            topic: currentLevelId.topic,
            levelId: currentTopic.levels[currentLevelIndex + 1].filename
        };
    }

    // Otherwise, find the next topic with levels
    const currentTopicIndex = topics.findIndex(t => t.name === currentLevelId.topic);
    for (let i = currentTopicIndex + 1; i < topics.length; i++) {
        if (topics[i].levels.length > 0) {
            return {
                topic: topics[i].name,
                levelId: topics[i].levels[0].filename
            };
        }
    }

    // No more levels
    return null;
};

/**
 * Game state reducer
 * @param state - Current state
 * @param action - Action to perform
 * @returns New state
 */
export function gameReducer(state: GameState = initialState, action: GameAction): GameState {
    console.log(action);

    switch (action.type) {
        case CODE_CLICK: {
            if (!state.currentLevel) return state;
            if (state.currentLevel.isFinished) return state;

            const {lineIndex, colIndex, token} = action.payload;

            // Find the region that contains the clicked position
            const region = state.currentLevel.regions?.find(r => r.contains(lineIndex, colIndex, token.length));

            if (region) {
                // If a region was found, dispatch APPLY_FIX
                return gameReducer(state, applyFix(region.eventId));
            } else {
                // If no region was found, dispatch WRONG_CLICK
                return gameReducer(state, wrongClick(lineIndex, colIndex, token));
            }
        }
        case LOAD_LEVEL: {
            const {levelId} = action.payload;

            // Use levelReducer to handle level state
            const newLevelState = levelReducer(null, action, state.topics);

            if (!newLevelState) return state;

            // Use chatReducer to handle chat messages
            const newChatMessages = chatReducer([], action, {
                topics: state.topics,
                currentLevel: newLevelState
            });

            return {
                ...state,
                currentLevelId: levelId,
                currentLevel: newLevelState,
                chatMessages: newChatMessages,
                isTypingAnimationComplete: false
            };
        }

        case APPLY_FIX: {
            if (!state.currentLevel) return state;

            // Use levelReducer to handle level state
            const newLevelState = levelReducer(state.currentLevel, action, state.topics);

            // Use chatReducer to handle chat messages
            const newChatMessages = chatReducer(
                state.chatMessages,
                action,
                {
                    currentLevel: state.currentLevel,
                    topics: state.topics,
                    discoveredWisdoms: state.discoveredWisdoms
                }
            );

            // Use progressReducer to handle the progress state
            const {solvedLevels, discoveredWisdoms} = progressReducer(
                {
                    solvedLevels: state.solvedLevels,
                    discoveredWisdoms: state.discoveredWisdoms
                },
                action,
                {
                    currentLevel: newLevelState,
                    currentLevelId: state.currentLevelId
                }
            );

            if (!newLevelState) return state;

            return {
                ...state,
                currentLevel: newLevelState,
                chatMessages: newChatMessages,
                solvedLevels,
                discoveredWisdoms,
                isTypingAnimationComplete: false
            };
        }

        case GET_HINT: {
            if (!state.currentLevel) return state;

            // Use levelReducer to handle level state
            const newLevelState = levelReducer(state.currentLevel, action);

            // Use chatReducer to handle chat messages
            const newChatMessages = chatReducer(
                state.chatMessages,
                action,
                {currentLevel: state.currentLevel}
            );

            if (!newLevelState) return state;

            return {
                ...state,
                currentLevel: newLevelState,
                chatMessages: newChatMessages,
                isTypingAnimationComplete: false
            };
        }

        case WRONG_CLICK: {
            if (!state.currentLevel) return state;

            // Use levelReducer to handle level state
            const newLevelState = levelReducer(state.currentLevel, action);

            // Use chatReducer to handle chat messages
            const newChatMessages = chatReducer(state.chatMessages, action);

            if (!newLevelState) return state;

            return {
                ...state,
                currentLevel: newLevelState,
                chatMessages: newChatMessages,
                isTypingAnimationComplete: false
            };
        }

        case POST_CHAT_MESSAGE: {
            const {message} = action.payload;

            // Use chatReducer to handle chat messages
            const newChatMessages = chatReducer(state.chatMessages, action);

            // Set typing animation complete to false for buddy messages
            const isTypingAnimationComplete = message.type === 'me';

            return {
                ...state,
                chatMessages: newChatMessages,
                isTypingAnimationComplete
            };
        }

        case RESET_PROGRESS: {
            // Use progressReducer to handle the progress state
            const {solvedLevels, discoveredWisdoms} = progressReducer(
                {
                    solvedLevels: state.solvedLevels,
                    discoveredWisdoms: state.discoveredWisdoms
                },
                action
            );

            // Reset to the initial state but keep the topics loaded
            return {
                ...initialState,
                topics: state.topics,
                solvedLevels,
                discoveredWisdoms
            };
        }

        case TOGGLE_NOTEBOOK: {
            return {
                ...state,
                notebookOpen: !state.notebookOpen
            };
        }

        case NEXT_LEVEL: {
            if (!state.currentLevel || !state.currentLevelId) return state;

            // Use progressReducer to handle the progress state
            const {solvedLevels, discoveredWisdoms} = progressReducer(
                {
                    solvedLevels: state.solvedLevels,
                    discoveredWisdoms: state.discoveredWisdoms
                },
                action,
                {currentLevel: state.currentLevel}
            );

            const nextLevelId = findNextLevelId(state.topics, state.currentLevelId);
            if (!nextLevelId) {
                return {
                    ...state,
                    discoveredWisdoms
                };
            }

            // Load the next level
            return gameReducer(
                {
                    ...state,
                    solvedLevels,
                    discoveredWisdoms
                },
                loadLevel(nextLevelId)
            );
        }

        case SET_TYPING_ANIMATION_COMPLETE: {
            const {isComplete} = action.payload;
            return {
                ...state,
                isTypingAnimationComplete: isComplete
            };
        }

        // Authentication action handlers
        case LOGIN_REQUEST: {
            return {
                ...state,
                auth: {
                    ...state.auth,
                    isLoading: true,
                    error: null
                }
            };
        }

        case LOGIN_SUCCESS: {
            const {user} = action.payload;
            return {
                ...state,
                auth: {
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                }
            };
        }

        case LOGIN_FAILURE: {
            const {error} = action.payload;
            return {
                ...state,
                auth: {
                    ...state.auth,
                    isLoading: false,
                    error,
                    isAuthenticated: false
                }
            };
        }

        case LOGOUT: {
            return {
                ...state,
                auth: {
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null
                }
            };
        }

        case SET_SOLVED_LEVELS: {
            const {solvedLevels} = action.payload;
            return {
                ...state,
                solvedLevels
            };
        }

        default:
            return state;
    }
}

// Create context for the game state
export const GameStateContext = createContext<{
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
} | null>(null);
