import React, {useEffect, useReducer} from 'react';
import {gameReducer, GameStateContext, initialState} from '../reducers';
import {onAuthStateChanged} from '../firebase/auth';
import {loadPlayerStats, savePlayerStats} from '../firebase/firestore';
import {loginSuccess, setPlayerStats} from '../reducers/actionCreators';

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

                try {
                    // Load player statistics from Firestore
                    const playerStats = await loadPlayerStats(user);
                    // Update state with loaded player statistics
                    dispatch(setPlayerStats(playerStats));
                } catch (error) {
                    console.error('Error loading player data:', error);
                }
            }
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
    }, []);

    // Save player statistics to Firestore whenever they change
    useEffect(() => {
        const {user} = state.auth;
        if (user) {
            savePlayerStats(user, state.playerStats)
                .catch(error => console.error('Error saving player statistics:', error));
        }
    }, [state.playerStats, state.auth.user]);

    return (
        <GameStateContext.Provider value={{state, dispatch}}>
            {children}
        </GameStateContext.Provider>
    );
}
