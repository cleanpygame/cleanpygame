import {createContext} from 'react';
import levelsData from './data/levels.json';
import {applyEvents} from './utils/pylang.js';

// Action types
export const LOAD_LEVEL = 'LOAD_LEVEL';
export const APPLY_FIX = 'APPLY_FIX';
export const WRONG_CLICK = 'WRONG_CLICK';
export const GET_HINT = 'GET_HINT';
export const POST_BUDDY_MESSAGE = 'POST_BUDDY_MESSAGE';
export const RESET_PROGRESS = 'RESET_PROGRESS';
export const OPEN_NOTEBOOK = 'OPEN_NOTEBOOK';
export const CLOSE_NOTEBOOK = 'CLOSE_NOTEBOOK';
export const NEXT_LEVEL = 'NEXT_LEVEL';
export const CODE_CLICK = 'CODE_CLICK';

const AUTO_HINT_DELAY = 20_000;
/**
 * Find the next hint ID based on triggered events
 * @param {LevelData} levelData - Level data
 * @param {string[]} triggeredEvents - Events already triggered
 * @returns {string|null} Next hint ID or null
 */
const calculateNextHintId = (levelData, triggeredEvents) => {
  // Find the first block with a hint that hasn't been triggered yet
  const blockWithHint = levelData.blocks.find(
      block => block.hint && block.event && !triggeredEvents.includes(block.event)
  );

  return blockWithHint ? blockWithHint.event : null;
};

/**
 * Creates initial level state with zero progress
 * @param {LevelData} levelData - Data for the level
 * @returns {LevelState} Initial level state
 */
const createInitialLevelState = (levelData) => {
  const {code, regions} = applyEvents(levelData.blocks, []);
  return {
    level: levelData,
    code,
    regions,
    triggeredEvents: [],
    isFinished: false,
    pendingHintId: calculateNextHintId(levelData, []),
    autoHintAt: Date.now() + AUTO_HINT_DELAY,
  };
};

let firstTopic = levelsData.topics[0];
// Initial state
export const initialState = {
  topics: levelsData.topics,
  currentLevelId: {topic: firstTopic.name, levelId:firstTopic.levels[0].filename},
  currentLevel: createInitialLevelState(firstTopic.levels[0]),
  solvedLevels: [],
  discoveredWisdoms: [],
  notebookOpen: false,
  chatMessages: [getInstructionChatMessage(firstTopic.levels[0])],
};


/**
 * Find the next level ID in sequence
 * @param {GameState} state - Current game state
 * @returns {LevelId|null} Next level ID or null if no next level
 */
const findNextLevelId = (state) => {
  const { topics, currentLevelId } = state;
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
 * @param {Topic[]} topics - All topics
 * @param {LevelId} levelId - Level identifier
 * @returns {LevelData|null} Level data or null if not found
 */
const findLevelData = (topics, levelId) => {
  const topic = topics.find(t => t.name === levelId.topic);
  if (!topic) return null;

  return topic.levels.find(l => l.filename === levelId.levelId) || null;
};

function getInstructionChatMessage(levelData) {
  return {
    type: 'buddy-instruct',
    text: `Let's look at ${levelData.filename}. Find and fix all the issues in this code.`
  };
}

/**
 * Game state reducer
 * @param {GameState} state - Current state
 * @param {Object} action - Action to perform
 * @returns {GameState} New state
 */
export function gameReducer(state, action) {
  console.log(action.type, action.payload);
  switch (action.type) {
    case CODE_CLICK: {
      if (!state.currentLevel) return state;
      if (state.currentLevel.isFinished) return state;

      const {lineIndex, colIndex, token} = action.payload;

      // Find the region that contains the clicked position
      const region = state.currentLevel.regions.find(r => r.contains(lineIndex, colIndex, token.length));

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
      const { levelId } = action.payload;
      const levelData = findLevelData(state.topics, levelId);

      if (!levelData) return state;

      // Create an initial level state
      const newLevelState = createInitialLevelState(levelData);

      return {
        ...state,
        currentLevelId: levelId,
        currentLevel: newLevelState,
        chatMessages: [getInstructionChatMessage(levelData)]
      };
    }

    case APPLY_FIX: {
      if (!state.currentLevel) return state;

      const { eventId, lineIndex, colIndex, token } = action.payload;
      const triggeredEvents = state.currentLevel.triggeredEvents.includes(eventId)
          ? state.currentLevel.triggeredEvents
          : [...state.currentLevel.triggeredEvents, eventId];

      const nextHintId = calculateNextHintId(state.currentLevel.level, triggeredEvents);

      // Update code and regions with applyEvents
      const {code, regions} = applyEvents(state.currentLevel.level.blocks, triggeredEvents);

      // Find the block that was triggered
      const triggeredBlock = state.currentLevel.level.blocks.find(
          block => block.event === eventId
      );

      // Create messages for the chat
      const meMessage = {
        type: 'me',
        text: `I see issue at '${lineIndex+1}:${colIndex+1} → "${token}"`
      };

      const buddyExplainMessage = {
        id: `buddy-explain-${Date.now()}`,
        type: 'buddy-explain',
        text: `Good catch! ${triggeredBlock?.explanation}`
      };

      // Check if all issues are fixed
      const allIssuesFixed = state.currentLevel.level.blocks
          .filter(block => block.event && block.type !== 'neutral')
          .every(block => triggeredEvents.includes(block.event) || eventId === block.event);

      // If all issues are fixed, add a summary message
      const buddySummarizeMessage = allIssuesFixed ? {
        type: 'buddy-summarize',
        text: 'Great job! You\'ve fixed all the issues in this level.'
      } : null;

      // Add messages to chat
      const newMessages = [
        meMessage,
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
          justTriggeredEvent: null
        }
      };
    }

    case GET_HINT: {
      if (!state.currentLevel) return state;

      // Find the block with the pending hint
      const blockWithHint = state.currentLevel.level.blocks.find(
          block => block.event === state.currentLevel.pendingHintId
      );

      // Create a buddy help message
      const buddyHelpMessage = {
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

      const { lineIndex, colIndex, token } = action.payload;

      // Create messages for the chat
      const meMessage = {
        type: 'me',
        text: `I see issue at ${lineIndex+1}:${colIndex+1} → "${token}"`
      };

      const buddyRejectMessage = {
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
      const { message } = action.payload;

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

    case OPEN_NOTEBOOK: {
      return {
        ...state,
        notebookOpen: true
      };
    }

    case CLOSE_NOTEBOOK: {
      return {
        ...state,
        notebookOpen: false
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

      const nextLevelData = findLevelData(state.topics, nextLevelId);
      if (!nextLevelData) return newState;

      // Create a buddy instruction message for the next level
      const buddyInstructMessage = {
        type: 'buddy-instruct',
        text: `Let's look at ${nextLevelData.filename}. Find and fix all the issues in this code.`
      };

      return {
        ...newState,
        currentLevelId: nextLevelId,
        currentLevel: createInitialLevelState(nextLevelData),
        chatMessages: [buddyInstructMessage]
      };
    }

    default:
      return state;
  }
}

// Create context for the game state
export const GameStateContext = createContext(null);
