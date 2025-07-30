import {ChatMessage, ChatMessageType, GameState, LevelData} from '../types';
import {GameAction} from './actionCreators';
import {APPLY_FIX, GET_HINT, LOAD_COMMUNITY_LEVEL, LOAD_LEVEL, POST_CHAT_MESSAGE, WRONG_CLICK,} from './actionTypes';

export const DEFAULT_MESSAGE = 'Great job! You\'ve fixed all the issues in this level.';
export const DEFAULT_INSTRUCTION = 'Find and fix all the issues in this code.';
export const WRONG_CLICK_RESPONSE = 'Nope, not an issue.';

/**
 * Get instruction chat message for a level
 * @param levelData - Level data
 * @returns Chat message with instructions
 */
export const getInstructionChatMessage = (levelData: LevelData): ChatMessage => {
    return {
        type: 'buddy-instruct' as ChatMessageType,
        text: levelData.startMessage || DEFAULT_INSTRUCTION
    };
};

/**
 * Reducer for chat-related state
 * @param state - Current chat messages
 * @param action - Action to perform
 * @param fullState - Full game state (for context)
 * @returns New chat messages
 */
export function chatReducer(
    state: ChatMessage[] = [],
    action: GameAction,
    fullState: Partial<GameState> = {}
): ChatMessage[] {
    switch (action.type) {
        case LOAD_LEVEL: {
            const levelData = fullState.currentLevel?.level;
            if (!levelData) return state;
            return [getInstructionChatMessage(levelData)];
        }
        
        case LOAD_COMMUNITY_LEVEL: {
            const { levelData } = action.payload;
            return [getInstructionChatMessage(levelData)];
        }

        case APPLY_FIX: {
            const {eventId} = action.payload;
            const {currentLevel, topics} = fullState;

            if (!currentLevel || !topics) return state;

            // Find the block that was triggered
            const triggeredBlock = currentLevel.level.blocks.find(
                block => block.event === eventId && block.explanation
            );

            // Create a buddy explanation message
            const buddyExplainMessage: ChatMessage = {
                type: 'buddy-explain',
                text: triggeredBlock?.explanation || 'Good job!'
            };

            // Check if all issues are fixed
            const allIssuesFixed = currentLevel.level.blocks
                .filter(block => block.event && block.type !== 'neutral')
                .every(block =>
                    currentLevel.triggeredEvents.includes(block.event || '') ||
                    eventId === block.event
                );

            // If all issues are fixed, add a summary message
            let buddySummarizeMessage: ChatMessage | null = null;

            if (allIssuesFixed) {
                const messageText = currentLevel.level.finalMessage || DEFAULT_MESSAGE;

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

            return [...state, ...newMessages];
        }

        case GET_HINT: {
            const {currentLevel} = fullState;

            if (!currentLevel) return state;

            // Find the block with the pending hint
            const blockWithHint = currentLevel.level.blocks.find(
                block => block.event === currentLevel.pendingHintId && block.hint
            );

            // Create a buddy help message
            const buddyHelpMessage: ChatMessage = {
                type: 'buddy-help',
                text: blockWithHint?.hint || 'Try looking for issues in the code.'
            };

            return [...state, buddyHelpMessage];
        }

        case WRONG_CLICK: {
            const {lineIndex, colIndex, token} = action.payload;

            // Create messages for the chat
            const meMessage: ChatMessage = {
                type: 'me',
                text: `I see issue at ${lineIndex + 1}:${colIndex + 1} → "${token}"`
            };

            const buddyRejectMessage: ChatMessage = {
                type: 'buddy-reject',
                text: WRONG_CLICK_RESPONSE
            };

            return [...state, meMessage, buddyRejectMessage];
        }

        case POST_CHAT_MESSAGE: {
            const {message} = action.payload;
            return [...state, message];
        }

        default:
            return state;
    }
}
