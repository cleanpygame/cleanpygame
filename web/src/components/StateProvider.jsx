import { useReducer, useEffect } from 'react';
import { gameReducer, initialState, GameStateContext } from '../reducer.js';
/**
 * Provider component for game state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function StateProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load levels data on mount
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        // In a real app, this would fetch from an API or import a JSON file
        // For now, we'll mock it with an empty array
        const levelsData = { topics: [] };
        
        dispatch({
          type: 'SET_TOPICS',
          payload: { topics: levelsData.topics }
        });
        
        // If there are topics and levels, load the first one
        if (levelsData.topics.length > 0 && levelsData.topics[0].levels.length > 0) {
          dispatch({
            type: 'LOAD_LEVEL',
            payload: {
              levelId: {
                topic: levelsData.topics[0].name,
                levelId: levelsData.topics[0].levels[0].filename
              }
            }
          });
        }
      } catch (error) {
        console.error('Failed to load levels:', error);
      }
    };

    fetchLevels();
  }, []);

  // Check timer for auto-hint
  useEffect(() => {
    if (!state.currentLevel || !state.currentLevel.autoHintAt) return;

    const checkAutoHint = () => {
      if (
        state.currentLevel.autoHintAt &&
        !state.currentLevel.isHintShown &&
        state.currentLevel.currentHintId &&
        Date.now() >= state.currentLevel.autoHintAt
      ) {
        dispatch({ type: 'SHOW_HINT' });
      }
    };

    const timerId = setInterval(checkAutoHint, 1000);
    return () => clearInterval(timerId);
  }, [state.currentLevel]);

  // Check timer for unlocking UI after mistake
  useEffect(() => {
    if (
      !state.currentLevel ||
      !state.currentLevel.lockUiUntil
    ) return;

    const checkUnlock = () => {
      if (
        state.currentLevel.lockUiUntil &&
        Date.now() >= state.currentLevel.lockUiUntil
      ) {
        dispatch({ type: 'UNLOCK' });
      }
    };

    const timerId = setInterval(checkUnlock, 100);
    return () => clearInterval(timerId);
  }, [state.currentLevel]);

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
}
