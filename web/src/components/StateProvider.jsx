import {useEffect, useReducer} from 'react';
import {gameReducer, GameStateContext, initialState} from '../reducer.js';

/**
 * Provider component for game state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function StateProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Check timer for an auto-hint
  useEffect(() => {
    if (!state.currentLevel || !state.currentLevel.autoHintAt) return;

    const checkAutoHint = () => {
      if (
        state.currentLevel.autoHintAt &&
        state.currentLevel.pendingHintId &&
        Date.now() >= state.currentLevel.autoHintAt
      ) {
        dispatch({ type: 'GET_HINT' });
      }
    };

    const timerId = setInterval(checkAutoHint, 1000);
    return () => clearInterval(timerId);
  }, [state.currentLevel]);

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
}
