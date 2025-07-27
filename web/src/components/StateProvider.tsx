import React, {useEffect, useReducer} from 'react';
import {gameReducer, GameStateContext, initialState} from '../reducers';
import {onAuthStateChanged} from '../firebase/auth';
import {loadSolvedLevels, saveSolvedLevels} from '../firebase/firestore';
import {loginSuccess, setSolvedLevels} from '../reducers/actionCreators';

interface StateProviderProps {
    children: React.ReactNode;
}

/**
 * Provider component for game state
 */
export function StateProvider({children}: StateProviderProps): React.ReactElement {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    // Set up auth state change listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(async (user) => {
            if (user) {
                // User is signed in
                dispatch(loginSuccess(user));

                // Load solved levels from Firestore
                try {
                    const solvedLevels = await loadSolvedLevels(user);
                    if (solvedLevels.length > 0) {
                        // Update state with loaded solved levels
                        dispatch(setSolvedLevels(solvedLevels));
                    }
                } catch (error) {
                    console.error('Error loading solved levels:', error);
                }
            }
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
    }, []);

    // Save solvedLevels to Firestore whenever it changes
    useEffect(() => {
        const {user} = state.auth;
        if (user && state.solvedLevels.length > 0) {
            saveSolvedLevels(user, state.solvedLevels)
                .catch(error => console.error('Error saving solved levels:', error));
        }
    }, [state.solvedLevels, state.auth.user]);

    return (
        <GameStateContext.Provider value={{state, dispatch}}>
            {children}
        </GameStateContext.Provider>
    );
}
