import React, {useContext} from 'react';
import {GameStateContext} from '../reducers';
import {
    loginFailure,
    loginRequest,
    loginSuccess,
    logout,
    resetProgress,
    toggleStatsPage
} from '../reducers/actionCreators';
import {savePlayerStats} from '../firebase/firestore';
import {createDefaultPlayerStats} from '../reducers/statsReducer';

/**
 * Top navigation bar component
 * Dispatches actions: TOGGLE_NOTEBOOK, RESET_PROGRESS, GET_HINT
 */
export function TopBar(): React.ReactElement {
    const context = useContext(GameStateContext);

    if (!context) {
        throw new Error('TopBar must be used within a GameStateContext Provider');
    }

    const {dispatch, state} = context;
    const {auth} = state;

    function renderLogoutButton() {
        return <button
            onClick={async () => {
                try {
                    dispatch(loginRequest());
                    const {signOut: firebaseSignOut} = await import('../firebase/auth');
                    await firebaseSignOut();
                    dispatch(logout());
                } catch (error) {
                    console.error('Error signing out:', error);
                }
            }}
            className="px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors"
            title="Sign Out"
        >
            <span>{auth.user?.displayName || 'Sign Out'}</span>
        </button>;
    }

    function renderLoginButton() {
        return <button
            onClick={async () => {
                try {
                    dispatch(loginRequest());
                    const {signInWithGoogle: firebaseSignInWithGoogle} = await import('../firebase/auth');
                    const result = await firebaseSignInWithGoogle();

                    if (result.user) {
                        const user = {
                            uid: result.user.uid,
                            displayName: result.user.displayName,
                            email: result.user.email,
                            photoURL: result.user.photoURL
                        };
                        dispatch(loginSuccess(user));
                    }
                } catch (error) {
                    dispatch(loginFailure(error instanceof Error ? error.message : 'An unknown error occurred'));
                }
            }}
            className="px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors"
            title="Login with Google"
            disabled={auth.isLoading}
        >
            <span>{auth.isLoading ? 'Signing in...' : 'Login'}</span>
        </button>;
    }

    function renderResetProgressButton() {
        return (
            <button
                onClick={async () => {
                    if (window.confirm('Are you sure you want to reset all your progress? This will reset all level completions and statistics.')) {
                        // Reset state through reducer
                        dispatch(resetProgress());

                        // Directly update Firestore with reset stats
                        const {user} = state.auth;
                        if (user) {
                            try {
                                // Save default stats to Firestore
                                await savePlayerStats(user, createDefaultPlayerStats());
                                console.log('Player statistics reset in Firestore');
                            } catch (error) {
                                console.error('Error resetting player statistics in Firestore:', error);
                            }
                        }
                    }
                }}
                className="px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors"
                title="Reset Progress">
                <span>Reset Progress</span>
            </button>);
    }

    function renderStatsButton() {
        return (
            <button
                onClick={() => dispatch(toggleStatsPage())}
                className="px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors"
                title={state.statsPageVisible ? "Back to Game" : "View Statistics"}>
                <span>{state.statsPageVisible ? "Back to Game" : "Stats"}</span>
            </button>
        );
    }

    return (
        <div className="flex items-center justify-between h-12 px-4 bg-[#252526] border-b border-[#3c3c3c]">
            <div className="text-lg font-medium">Clean Code Game</div>
            <div className="flex gap-4">
                {renderStatsButton()}
                {renderResetProgressButton()}
                {auth.isAuthenticated ? renderLogoutButton() : renderLoginButton()}
            </div>
        </div>
    );
}
