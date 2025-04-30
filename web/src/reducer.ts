import React, {createContext} from 'react';
import levelsData from './data/levels.json';
import {applyEvents} from './utils/pylang';
import {ChatMessage, ChatMessageType, GameState, LevelData, LevelId, LevelState, Topic} from './types';

// Action types
export const LOAD_LEVEL = 'LOAD_LEVEL';
export const APPLY_FIX = 'APPLY_FIX';
export const WRONG_CLICK = 'WRONG_CLICK';
export const GET_HINT = 'GET_HINT';
export const POST_BUDDY_MESSAGE = 'POST_BUDDY_MESSAGE';
export const RESET_PROGRESS = 'RESET_PROGRESS';
export const TOGGLE_NOTEBOOK = 'TOGGLE_NOTEBOOK';
export const NEXT_LEVEL = 'NEXT_LEVEL';
export const CODE_CLICK = 'CODE_CLICK';

// Action interfaces
interface LoadLevelAction {
    type: typeof LOAD_LEVEL;
    payload: {
        levelId: LevelId;
    };
}

interface ApplyFixAction {
    type: typeof APPLY_FIX;
    payload: {
        eventId: string;
        lineIndex: number;
        colIndex: number;
        token: string;
    };
}

interface WrongClickAction {
    type: typeof WRONG_CLICK;
    payload: {
        lineIndex: number;
        colIndex: number;
        token: string;
    };
}

interface GetHintAction {
    type: typeof GET_HINT;
}

interface PostBuddyMessageAction {
    type: typeof POST_BUDDY_MESSAGE;
    payload: {
        message: ChatMessage;
    };
}

interface ResetProgressAction {
    type: typeof RESET_PROGRESS;
}

interface ToggleNotebookAction {
    type: typeof TOGGLE_NOTEBOOK;
}

interface NextLevelAction {
    type: typeof NEXT_LEVEL;
}

interface CodeClickAction {
    type: typeof CODE_CLICK;
    payload: {
        lineIndex: number;
        colIndex: number;
        token: string;
    };
}

type GameAction =
    | LoadLevelAction
    | ApplyFixAction
    | WrongClickAction
    | GetHintAction
    | PostBuddyMessageAction
    | ResetProgressAction
    | ToggleNotebookAction
    | NextLevelAction
    | CodeClickAction;

const AUTO_HINT_DELAY = 20_000;

/**
 * Find the next hint ID based on triggered events
 * @param levelData - Level data
 * @param triggeredEvents - Events already triggered
 * @returns Next hint ID or null
 */
const calculateNextHintId = (levelData: LevelData, triggeredEvents: string[]): string | null => {
    // Find the first block with a hint that hasn't been triggered yet
    const blockWithHint = levelData.blocks.find(
        block => block.hint && block.event && !triggeredEvents.includes(block.event || '')
    );

    return blockWithHint?.event || null;
};

/**
 * Creates initial level state with zero progress
 * @param levelData - Data for the level
 * @returns Initial level state
 */
const createInitialLevelState = (levelData: LevelData): LevelState => {
    const {code, regions} = applyEvents(levelData.blocks, []);
    return {
        level: levelData,
        triggeredEvents: [],
        pendingHintId: calculateNextHintId(levelData, []),
        autoHintAt: Date.now() + AUTO_HINT_DELAY,
        code,
        regions,
        isFinished: false,
    };
};

let firstTopic = levelsData.topics[0];
// Initial state
export const initialState: GameState = {
    topics: levelsData.topics as Topic[],
    currentLevelId: {topic: firstTopic.name, levelId: firstTopic.levels[0].filename},
    currentLevel: createInitialLevelState(firstTopic.levels[0]),
    solvedLevels: [],
    discoveredWisdoms: [],
    notebookOpen: false,
    chatMessages: [],
};

/**
 * Find the next level ID in sequence
 * @param state - Current game state
 * @returns Next level ID or null if no next level
 */
const findNextLevelId = (state: GameState): LevelId | null => {
    const {topics, currentLevelId} = state;
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
 * Find a level by its ID
 * @param topics - All topics
 * @param levelId - Level identifier
 * @returns Level data or null if not found
 */
const findLevelData = (topics: Topic[], levelId: LevelId): LevelData | null => {
    const topic = topics.find(t => t.name === levelId.topic);
    if (!topic) return null;

    return topic.levels.find(l => l.filename === levelId.levelId) || null;
};

function getInstructionChatMessage(levelData: LevelData): ChatMessage {
    return {
        type: 'buddy-instruct' as ChatMessageType,
        text: levelData.instructions || `Find and fix all the issues in this code.`
    };
}

/**
 * Game state reducer
 * @param state - Current state
 * @param action - Action to perform
 * @returns New state
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
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
                return gameReducer(state, {
                    type: APPLY_FIX,
                    payload: {eventId: region.eventId, lineIndex, colIndex, token}
                });
            } else {
                // If no region was found, dispatch WRONG_CLICK
                return gameReducer(state, {
                    type: WRONG_CLICK,
                    payload: {lineIndex, colIndex, token}
                });
            }
        }
        case LOAD_LEVEL: {
            const {levelId} = action.payload;
            const levelData = findLevelData(state.topics, levelId);

            if (!levelData) return state;

            // Create an initial level state
            const newLevelState = createInitialLevelState(levelData);

            // Create messages for the chat
            const messages = [];

            // Add a buddy message if it exists
            if (levelData.chat && levelData.chat.buddy) {
                messages.push({
                    type: 'buddy-instruct' as ChatMessageType,
                    text: levelData.chat.buddy
                });
            } else {
                messages.push(getInstructionChatMessage(levelData));
            }

            return {
                ...state,
                currentLevelId: levelId,
                currentLevel: newLevelState,
                chatMessages: messages
            };
        }

        case APPLY_FIX: {
            if (!state.currentLevel) return state;

            const {eventId} = action.payload;
            const triggeredEvents = state.currentLevel.triggeredEvents.includes(eventId)
                ? state.currentLevel.triggeredEvents
                : [...state.currentLevel.triggeredEvents, eventId];

            const nextHintId = calculateNextHintId(state.currentLevel.level, triggeredEvents);

            // Update code and regions with applyEvents
            const {code, regions} = applyEvents(state.currentLevel.level.blocks, triggeredEvents);

            // Find the block that was triggered
            const triggeredBlock = state.currentLevel.level.blocks.find(
                block => block.event === eventId && block.explanation
            );

            // Create a buddy explanation message
            const buddyExplainMessage: ChatMessage = {
                type: 'buddy-explain',
                text: triggeredBlock?.explanation || 'Good job!'
            };

            // Check if all issues are fixed
            const allIssuesFixed = state.currentLevel.level.blocks
                .filter(block => block.event && block.type !== 'neutral')
                .every(block => triggeredEvents.includes(block.event || '') || eventId === block.event);

            // If all issues are fixed, add a summary message with wisdoms
            let buddySummarizeMessage: ChatMessage | null = null;

            if (allIssuesFixed) {
                // Get the wisdoms for this level
                const levelWisdoms = state.currentLevel.level.wisdoms;

                // Find the wisdom entries
                const wisdomEntries = levelWisdoms.map(wisdomId => {
                    // Find the topic that contains this wisdom
                    for (const topic of state.topics) {
                        const wisdom = topic.wisdoms.find(w => w.id === wisdomId);
                        if (wisdom) {
                            return wisdom;
                        }
                    }
                    return null;
                }).filter(Boolean);

                // Create the message text
                let messageText = 'Great job! You\'ve fixed all the issues in this level.';

                // Add wisdoms if there are any
                if (wisdomEntries.length > 0) {
                    messageText += '\n\nWisdoms unlocked:\n';
                    wisdomEntries.forEach((wisdom, index) => {
                        if (wisdom) {
                            messageText += `${index + 1}. ${wisdom.text}\n`;
                        }
                    });
                }

                buddySummarizeMessage = {
                    type: 'buddy-summarize',
                    text: messageText
                };
            }

            // Add messages to chat
            const newMessages: ChatMessage[] = [
                buddyExplainMessage,
                ...(buddySummarizeMessage ? [buddySummarizeMessage] : [])
            ];

            // Add the current level to solved levels if all issues are fixed
            let solvedLevels = state.solvedLevels;
            if (allIssuesFixed) {
                solvedLevels = state.solvedLevels.some(
                    level => level.topic === state.currentLevelId.topic &&
                        level.levelId === state.currentLevelId.levelId
                )
                    ? state.solvedLevels
                    : [...state.solvedLevels, state.currentLevelId];
            }

            return {
                ...state,
                chatMessages: [...state.chatMessages, ...newMessages],
                solvedLevels: solvedLevels,
                currentLevel: {
                    ...state.currentLevel,
                    code,
                    regions,
                    triggeredEvents,
                    isFinished: allIssuesFixed,
                    pendingHintId: nextHintId,
                    autoHintAt: Date.now() + AUTO_HINT_DELAY,
                }
            };
        }

        case GET_HINT: {
            if (!state.currentLevel) return state;

            // Find the block with the pending hint
            const blockWithHint = state.currentLevel.level.blocks.find(
                block => block.event === state.currentLevel.pendingHintId && block.hint
            );

            // Create a buddy help message
            const buddyHelpMessage: ChatMessage = {
                type: 'buddy-help',
                text: blockWithHint?.hint || 'Try looking for issues in the code.'
            };

            return {
                ...state,
                chatMessages: [...state.chatMessages, buddyHelpMessage],
                currentLevel: {
                    ...state.currentLevel,
                    pendingHintId: null,
                    autoHintAt: Date.now() + AUTO_HINT_DELAY
                }
            };
        }

        case WRONG_CLICK: {
            if (!state.currentLevel) return state;

            const {lineIndex, colIndex, token} = action.payload;

            // Create messages for the chat
            const meMessage: ChatMessage = {
                type: 'me',
                text: `I see issue at ${lineIndex + 1}:${colIndex + 1} → "${token}"`
            };

            const buddyRejectMessage: ChatMessage = {
                type: 'buddy-reject',
                text: 'Nope, not an issue.'
            };

            return {
                ...state,
                chatMessages: [...state.chatMessages, meMessage, buddyRejectMessage],
                currentLevel: {
                    ...state.currentLevel,
                    autoHintAt: Date.now() + AUTO_HINT_DELAY,
                }
            };
        }

        case POST_BUDDY_MESSAGE: {
            const {message} = action.payload;

            return {
                ...state,
                chatMessages: [...state.chatMessages, message]
            };
        }

        case RESET_PROGRESS: {
            // Reset to the initial state but keep the topics loaded
            return {
                ...initialState,
                topics: state.topics
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

            // Add current level wisdoms to discovered wisdoms
            const newWisdoms = state.currentLevel.level.wisdoms.filter(
                w => !state.discoveredWisdoms.includes(w)
            );

            const discoveredWisdoms = [
                ...state.discoveredWisdoms,
                ...newWisdoms
            ];

            const newState = {
                ...state,
                discoveredWisdoms,
            };

            const nextLevelId = findNextLevelId(state);
            if (!nextLevelId) return newState;

            return gameReducer(newState, {
                type: LOAD_LEVEL,
                payload: {levelId: nextLevelId}
            });
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
