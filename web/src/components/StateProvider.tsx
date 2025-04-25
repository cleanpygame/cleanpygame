import React, {useEffect, useReducer} from 'react';
import {gameReducer, GameStateContext, initialState} from '../reducer';

interface StateProviderProps {
    children: React.ReactNode;
}

/**
 * Provider component for game state
 */
export function StateProvider({children}: StateProviderProps): React.ReactElement {
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
                dispatch({type: 'GET_HINT'});
            }
        };

        const timerId = setInterval(checkAutoHint, 1000);
        return () => clearInterval(timerId);
    }, [state.currentLevel]);

    return (
        <GameStateContext.Provider value={{state, dispatch}}>
            {children}
        </GameStateContext.Provider>
    );
}