import React, {useEffect, useReducer} from 'react';
import {gameReducer, GameStateContext, initialState} from '../reducers';
import {onAuthStateChanged, signInAnonymously} from '../firebase/auth';
import {loadPlayerStats, savePlayerStats} from '../firebase/firestore';
import {loginFailure, loginRequest, loginSuccess, setPlayerStats} from '../reducers/actionCreators';

interface StateProviderProps {
    children: React.ReactNode;
}

/**
 * Provider component for game state
 */
export function StateProvider({children}: StateProviderProps): React.ReactElement {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    // Set up auth state change listener and anonymous authentication
    useEffect(() => {
        let isFirstAuthChange = true;
        
        const unsubscribe = onAuthStateChanged(async (user) => {
            if (user) {
                // User is signed in (could be anonymous or regular)
                dispatch(loginSuccess(user, user.isAnonymous));

                try {
                    // Load player statistics from Firestore
                    const playerStats = await loadPlayerStats(user);
                    // Update state with loaded player statistics
                    dispatch(setPlayerStats(playerStats));
                } catch (error) {
                    console.error('Error loading player data:', error);
                }
            } else if (isFirstAuthChange) {
                // No user is signed in and this is the first auth state change
                // Sign in anonymously
                isFirstAuthChange = false;
                try {
                    dispatch(loginRequest());
                    const result = await signInAnonymously();
                    if (result.user) {
                        const anonymousUser = {
                            uid: result.user.uid,
                            displayName: null,
                            email: null,
                            photoURL: null
                        };
                        dispatch(loginSuccess(anonymousUser, true));
                    }
                } catch (error) {
                    console.error('Error signing in anonymously:', error);
                    dispatch(loginFailure(error instanceof Error ? error.message : 'An unknown error occurred'));
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
