import React, {createContext} from 'react';
import levelsData from '../data/levels.json';
import {GameState, LevelId, Topic} from '../types.ts';
import {applyFix, GameAction, loadLevel, updateLevelStats, wrongClick} from './actionCreators.ts';
import {getCurrentLevelKey} from '../utils/levelUtils';
import {
    APPLY_FIX,
    CODE_CLICK,
    CREATE_GROUP_FAILURE,
    CREATE_GROUP_REQUEST,
    CREATE_GROUP_SUCCESS,
    FETCH_GROUP_BY_ID_FAILURE,
    FETCH_GROUP_BY_ID_REQUEST,
    FETCH_GROUP_BY_ID_SUCCESS,
    FETCH_GROUP_BY_JOIN_CODE_FAILURE,
    FETCH_GROUP_BY_JOIN_CODE_REQUEST,
    FETCH_GROUP_BY_JOIN_CODE_SUCCESS,
    FETCH_GROUPS_FAILURE,
    FETCH_GROUPS_REQUEST,
    FETCH_GROUPS_SUCCESS,
    GET_HINT,
    JOIN_GROUP_FAILURE,
    JOIN_GROUP_REQUEST,
    JOIN_GROUP_SUCCESS,
    LOAD_LEVEL,
    LOGIN_FAILURE,
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGOUT,
    NEXT_LEVEL,
    POST_CHAT_MESSAGE,
    RESET_PROGRESS,
    SELECT_GROUP,
    SET_PLAYER_STATS,
    SET_TYPING_ANIMATION_COMPLETE,
    TOGGLE_JOIN_CODE_ACTIVE_FAILURE,
    TOGGLE_JOIN_CODE_ACTIVE_REQUEST,
    TOGGLE_JOIN_CODE_ACTIVE_SUCCESS,
    TOGGLE_NOTEBOOK,
    UPDATE_GROUP_NAME_FAILURE,
    UPDATE_GROUP_NAME_REQUEST,
    UPDATE_GROUP_NAME_SUCCESS,
    WRONG_CLICK
} from './actionTypes.ts';
import {createInitialLevelState, levelReducer} from './levelReducer.ts';
import {chatReducer, getInstructionChatMessage} from './chatReducer.ts';
import {progressReducer} from './progressReducer.ts';
import {createDefaultPlayerStats, statsReducer} from './statsReducer.ts';


let firstTopic = levelsData.topics[1]; // skip testing
// Initial state
let firstLevel = firstTopic.levels[0];
export const initialState: GameState = {
    topics: levelsData.topics as Topic[],
    currentLevelId: {topic: firstTopic.name, levelId: firstLevel.filename},
    currentLevel: createInitialLevelState(firstLevel),
    discoveredWisdoms: [],
    notebookOpen: false,
    chatMessages: [getInstructionChatMessage(firstLevel)],
    isTypingAnimationComplete: true,
    auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
    },
    playerStats: {
        summary: {
            totalTimeSpent: 0,
            totalLevelsSolved: 0,
            totalLevelCompletions: 0,
            totalHintsUsed: 0,
            totalMistakesMade: 0
        },
        levels: {}
    },
    ownedGroups: [],
    joinedGroups: [],
    isGroupsLoading: false,
    groupsError: undefined
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

            // Use progressReducer to handle the progress state (only discoveredWisdoms now)
            const {discoveredWisdoms} = progressReducer(
                {
                    discoveredWisdoms: state.discoveredWisdoms
                },
                action,
                {
                    currentLevel: newLevelState,
                    currentLevelId: state.currentLevelId
                }
            );

            if (!newLevelState) return state;

            // Check if the level is now finished
            const isLevelCompleted = newLevelState.isFinished && !state.currentLevel.isFinished;

            // Get level key for the current level
            const levelKey = getCurrentLevelKey(state);

            // Calculate time spent if level is completed
            let timeSpent;
            if (isLevelCompleted) {
                timeSpent = Math.floor((Date.now() - state.currentLevel.startTime) / 1000); // Convert to seconds
                // Cap time spent at 3 minutes (180 seconds) to ignore unusually large values
                if (timeSpent > 180) {
                    timeSpent = 180;
                }
            }

            // Use statsReducer to handle player statistics
            const playerStats = statsReducer(
                state.playerStats,
                updateLevelStats(
                    levelKey,
                    {},
                    timeSpent, // Time spent in seconds
                    isLevelCompleted,
                    isLevelCompleted ? state.currentLevel.sessionHintsUsed : 0, // Use tracked hints if completed
                    isLevelCompleted ? state.currentLevel.sessionMistakesMade : 0 // Use tracked mistakes if completed
                )
            );

            return {
                ...state,
                currentLevel: newLevelState,
                chatMessages: newChatMessages,
                discoveredWisdoms,
                playerStats,
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

            // No longer update player stats here - only track in session
            // Stats will be updated when the level is completed

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

            // No longer update player stats here - only track in session
            // Stats will be updated when the level is completed

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
            // Use progressReducer to handle the progress state (only discoveredWisdoms now)
            const {discoveredWisdoms} = progressReducer(
                {
                    discoveredWisdoms: state.discoveredWisdoms
                },
                action
            );

            // Reset player statistics
            const playerStats = createDefaultPlayerStats();

            // Reset to the initial state but keep the topics loaded
            return {
                ...initialState,
                topics: state.topics,
                discoveredWisdoms,
                playerStats
            };
        }

        case SET_PLAYER_STATS: {
            return {
                ...state,
                playerStats: action.payload.playerStats
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

            // Use progressReducer to handle the progress state (only discoveredWisdoms now)
            const {discoveredWisdoms} = progressReducer(
                {
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

        // Group management action handlers
        case CREATE_GROUP_REQUEST: {
            return {
                ...state,
                isGroupsLoading: true,
                groupsError: undefined
            };
        }

        case CREATE_GROUP_SUCCESS: {
            const {group} = action.payload;
            return {
                ...state,
                ownedGroups: [...state.ownedGroups, group],
                selectedGroup: group,
                isGroupsLoading: false,
                groupsError: undefined
            };
        }

        case CREATE_GROUP_FAILURE: {
            const {error} = action.payload;
            return {
                ...state,
                isGroupsLoading: false,
                groupsError: error
            };
        }

        case FETCH_GROUPS_REQUEST: {
            return {
                ...state,
                isGroupsLoading: true,
                groupsError: undefined
            };
        }

        case FETCH_GROUPS_SUCCESS: {
            const {ownedGroups, joinedGroups} = action.payload;
            return {
                ...state,
                ownedGroups,
                joinedGroups,
                isGroupsLoading: false,
                groupsError: undefined
            };
        }

        case FETCH_GROUPS_FAILURE: {
            const {error} = action.payload;
            return {
                ...state,
                isGroupsLoading: false,
                groupsError: error
            };
        }

        case SELECT_GROUP: {
            const {group} = action.payload;
            return {
                ...state,
                selectedGroup: group
            };
        }

        // Fetch group by ID action handlers
        case FETCH_GROUP_BY_ID_REQUEST: {
            return {
                ...state,
                isGroupsLoading: true,
                groupsError: undefined
            };
        }

        case FETCH_GROUP_BY_ID_SUCCESS: {
            const {group} = action.payload;
            return {
                ...state,
                selectedGroup: group,
                isGroupsLoading: false,
                groupsError: undefined
            };
        }

        case FETCH_GROUP_BY_ID_FAILURE: {
            const {error} = action.payload;
            return {
                ...state,
                isGroupsLoading: false,
                groupsError: error
            };
        }

        // Update group name action handlers
        case UPDATE_GROUP_NAME_REQUEST: {
            return {
                ...state,
                isGroupsLoading: true,
                groupsError: undefined
            };
        }

        case UPDATE_GROUP_NAME_SUCCESS: {
            const {groupId, newName} = action.payload;

            // Update the group in the ownedGroups array
            const updatedOwnedGroups = state.ownedGroups.map(group =>
                group.id === groupId ? {...group, name: newName} : group
            );

            // Update the selectedGroup if it's the one being renamed
            const updatedSelectedGroup = state.selectedGroup && state.selectedGroup.id === groupId
                ? {...state.selectedGroup, name: newName}
                : state.selectedGroup;

            return {
                ...state,
                ownedGroups: updatedOwnedGroups,
                selectedGroup: updatedSelectedGroup,
                isGroupsLoading: false,
                groupsError: undefined
            };
        }

        case UPDATE_GROUP_NAME_FAILURE: {
            const {error} = action.payload;
            return {
                ...state,
                isGroupsLoading: false,
                groupsError: error
            };
        }

        // Toggle join code active action handlers
        case TOGGLE_JOIN_CODE_ACTIVE_REQUEST: {
            return {
                ...state,
                isGroupsLoading: true,
                groupsError: undefined
            };
        }

        case TOGGLE_JOIN_CODE_ACTIVE_SUCCESS: {
            // We don't need to update any state here since the join code active status
            // is not stored in the Redux state, but in Firestore
            return {
                ...state,
                isGroupsLoading: false,
                groupsError: undefined
            };
        }

        case TOGGLE_JOIN_CODE_ACTIVE_FAILURE: {
            const {error} = action.payload;
            return {
                ...state,
                isGroupsLoading: false,
                groupsError: error
            };
        }

        // Fetch group by join code action handlers
        case FETCH_GROUP_BY_JOIN_CODE_REQUEST: {
            return {
                ...state,
                isGroupsLoading: true,
                groupsError: undefined
            };
        }

        case FETCH_GROUP_BY_JOIN_CODE_SUCCESS: {
            const {group} = action.payload;
            return {
                ...state,
                selectedGroup: group,
                isGroupsLoading: false,
                groupsError: undefined
            };
        }

        case FETCH_GROUP_BY_JOIN_CODE_FAILURE: {
            const {error} = action.payload;
            return {
                ...state,
                isGroupsLoading: false,
                groupsError: error
            };
        }

        // Join group action handlers
        case JOIN_GROUP_REQUEST: {
            return {
                ...state,
                isGroupsLoading: true,
                groupsError: undefined
            };
        }

        case JOIN_GROUP_SUCCESS: {
            const {group} = action.payload;
            return {
                ...state,
                selectedGroup: group,
                isGroupsLoading: false,
                groupsError: undefined
            };
        }

        case JOIN_GROUP_FAILURE: {
            const {error} = action.payload;
            return {
                ...state,
                isGroupsLoading: false,
                groupsError: error
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
