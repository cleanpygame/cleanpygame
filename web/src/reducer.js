import { createContext } from 'react';
import levelsData from './data/levels.json';

// Action types
export const LOAD_LEVEL = 'LOAD_LEVEL';
export const LOCK_AFTER_MISTAKE = 'LOCK_AFTER_MISTAKE';
export const UNLOCK = 'UNLOCK';
export const OPEN_FIX_PREVIEW = 'OPEN_FIX_PREVIEW';
export const CONFIRM_FIX = 'CONFIRM_FIX';
export const SHOW_HINT = 'SHOW_HINT';
export const HIDE_HINT = 'HIDE_HINT';
export const RESET_PROGRESS = 'RESET_PROGRESS';
export const OPEN_NOTEBOOK = 'OPEN_NOTEBOOK';
export const CLOSE_NOTEBOOK = 'CLOSE_NOTEBOOK';
export const NEXT_LEVEL = 'NEXT_LEVEL';

/**
 * Find the next hint ID based on triggered events
 * @param {LevelData} levelData - Level data
 * @param {string[]} triggeredEvents - Events already triggered
 * @returns {string|null} Next hint ID or null
 */
const calculateNextHintId = (levelData, triggeredEvents) => {
  // Find first block with a hint that hasn't been triggered yet
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
const createInitialLevelState = (levelData) => ({
  level: levelData,
  triggeredEvents: [],
  mistakeCount: 0,
  currentHintId: calculateNextHintId(levelData, []),
  isHintShown: false,
  autoHintAt: Date.now() + 20_000,
  lockUiUntil: null,
  justTriggeredEvent: null
});

let firstTopic = levelsData.topics[0];
// Initial state
export const initialState = {
  topics: levelsData.topics,
  currentLevelId: {topic: firstTopic.name, levelId:firstTopic.levels[0].filename},
  currentLevel: createInitialLevelState(firstTopic.levels[0]),
  solvedLevels: [],
  discoveredWisdoms: [],
  notebookState: 'closed'
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
  
  // Find current level index
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

/**
 * Game state reducer
 * @param {GameState} state - Current state
 * @param {Object} action - Action to perform
 * @returns {GameState} New state
 */
export function gameReducer(state, action) {
  console.log(action.type, action.payload);
  switch (action.type) {
    case LOAD_LEVEL: {
      const { levelId } = action.payload;
      const levelData = findLevelData(state.topics, levelId);
      
      if (!levelData) return state;
      
      return {
        ...state,
        currentLevelId: levelId,
        currentLevel: createInitialLevelState(levelData)
      };
    }
    
    case LOCK_AFTER_MISTAKE: {
      if (!state.currentLevel) return state;
      
      const mistakeCount = state.currentLevel.mistakeCount + 1;
      
      return {
        ...state,
        currentLevel: {
          ...state.currentLevel,
          mistakeCount,
          lockUiUntil: Date.now() + mistakeCount * 1000
        }
      };
    }
    
    case UNLOCK: {
      if (!state.currentLevel) return state;
      
      return {
        ...state,
        currentLevel: {
          ...state.currentLevel,
          lockUiUntil: null
        }
      };
    }
    
    case OPEN_FIX_PREVIEW: {
      if (!state.currentLevel) return state;
      
      const { eventId } = action.payload;
      
      return {
        ...state,
        currentLevel: {
          ...state.currentLevel,
          justTriggeredEvent: eventId,
          autoHintAt: null
        }
      };
    }
    
    case CONFIRM_FIX: {
      if (!state.currentLevel) return state;
      
      const { eventId } = action.payload;
      const triggeredEvents = state.currentLevel.triggeredEvents.includes(eventId)
        ? state.currentLevel.triggeredEvents
        : [...state.currentLevel.triggeredEvents, eventId];
      
      const nextHintId = calculateNextHintId(state.currentLevel.level, triggeredEvents);
      
      return {
        ...state,
        currentLevel: {
          ...state.currentLevel,
          triggeredEvents,
          justTriggeredEvent: null,
          isHintShown: false,
          currentHintId: nextHintId,
          autoHintAt: Date.now() + 20_000
        }
      };
    }
    
    case SHOW_HINT: {
      if (!state.currentLevel) return state;
      
      return {
        ...state,
        currentLevel: {
          ...state.currentLevel,
          isHintShown: true,
          autoHintAt: Date.now() + 20_000
        }
      };
    }
    
    case HIDE_HINT: {
      if (!state.currentLevel) return state;
      
      return {
        ...state,
        currentLevel: {
          ...state.currentLevel,
          isHintShown: false,
          autoHintAt: Date.now() + 20_000
        }
      };
    }
    
    case RESET_PROGRESS: {
      // Reset to initial state but keep the topics loaded
      return {
        ...initialState,
        topics: state.topics
      };
    }
    
    case OPEN_NOTEBOOK: {
      const { mode } = action.payload;
      
      return {
        ...state,
        notebookState: mode
      };
    }
    
    case CLOSE_NOTEBOOK: {
      return {
        ...state,
        notebookState: 'closed'
      };
    }
    
    case NEXT_LEVEL: {
      if (!state.currentLevel || !state.currentLevelId) return state;
      
      const nextLevelId = findNextLevelId(state);
      if (!nextLevelId) return state;
      
      const nextLevelData = findLevelData(state.topics, nextLevelId);
      if (!nextLevelData) return state;
      
      // Add current level wisdoms to discovered wisdoms
      const newWisdoms = state.currentLevel.level.wisdoms.filter(
        w => !state.discoveredWisdoms.includes(w)
      );
      
      const discoveredWisdoms = [
        ...state.discoveredWisdoms,
        ...newWisdoms
      ];
      
      // Add current level to solved levels
      const solvedLevels = state.solvedLevels.some(
        level => level.topic === state.currentLevelId.topic && 
                level.levelId === state.currentLevelId.levelId
      )
        ? state.solvedLevels
        : [...state.solvedLevels, state.currentLevelId];
      
      return {
        ...state,
        notebookState: 'closed',
        solvedLevels,
        discoveredWisdoms,
        currentLevelId: nextLevelId,
        currentLevel: createInitialLevelState(nextLevelData)
      };
    }
    
    default:
      return state;
  }
}

// Create context for game state
export const GameStateContext = createContext(null);
