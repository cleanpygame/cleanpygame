import React, {useEffect, useReducer} from 'react';
import {gameReducer, GameStateContext, initialState} from '../reducer';
import {LevelId} from '../types';

interface StateProviderProps {
    children: React.ReactNode;
}

/**
 * Load saved progress from localStorage
 */
const loadSavedProgress = () => {
    try {
        const savedSolvedLevels = localStorage.getItem('solvedLevels');
        if (savedSolvedLevels) {
            const solvedLevels = JSON.parse(savedSolvedLevels) as LevelId[];
            return {
                ...initialState,
                solvedLevels
            };
        }
    } catch (error) {
        console.error('Error loading saved progress:', error);
    }
    return initialState;
};

/**
 * Provider component for game state
 */
export function StateProvider({children}: StateProviderProps): React.ReactElement {
    const [state, dispatch] = useReducer(gameReducer, loadSavedProgress());

    // Save solvedLevels to localStorage whenever it changes
    useEffect(() => {
        if (state.solvedLevels.length > 0) {
            localStorage.setItem('solvedLevels', JSON.stringify(state.solvedLevels));
        } else {
            localStorage.removeItem('solvedLevels');
        }
    }, [state.solvedLevels]);

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
