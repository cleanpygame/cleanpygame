import React, {useContext, useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {GameStateContext} from '../reducers';
import {signInWithGoogle, signOut} from '../firebase/auth';
import {
    loginFailure,
    loginRequest,
    loginSuccess,
    logout,
    resetProgress,
    setAdminStatus
} from '../reducers/actionCreators';
import {isUserAdmin, savePlayerStats} from '../firebase/firestore';
import {createDefaultPlayerStats} from '../reducers/statsReducer';
import {parseDebugModeFromUrl} from '../utils/debugUtils';

/**
 * Top navigation bar component
 * Dispatches actions: RESET_PROGRESS, GET_HINT
 */
export function TopBar(): React.ReactElement {
    const context = useContext(GameStateContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [debugMode, setDebugMode] = useState(false);

    if (!context) {
        throw new Error('TopBar must be used within a GameStateContext Provider');
    }

    const {dispatch, state} = context;
    const {auth} = state;

    // Parse debug parameter from URL on component mount and when URL changes
    useEffect(() => {
        const isDebugEnabled = parseDebugModeFromUrl();
        setDebugMode(isDebugEnabled);
    }, [location.search]);

    // Check if the current user is an admin when they log in
    useEffect(() => {
        if (auth.user) {
            isUserAdmin(auth.user.uid)
                .then(adminStatus => {
                    dispatch(setAdminStatus(adminStatus));
                })
                .catch(error => {
                    console.error('Error checking admin status:', error);
                    dispatch(setAdminStatus(false));
                });
        } else {
            dispatch(setAdminStatus(false));
        }
    }, [auth.user, dispatch]);

    // Determine current page based on route
    const currentPath = location.pathname;
    const isMainPage = currentPath === '/';
    const isCommunityLevelsPage = currentPath.startsWith('/community-levels/');

    function renderLogoutButton() {
        return <button
            onClick={async () => {
                try {
                    dispatch(loginRequest());
                    await signOut();
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
                    const result = await signInWithGoogle();

                    if (result.user) {
                        const user = {
                            uid: result.user.uid,
                            displayName: result.user.displayName,
                            email: result.user.email,
                            photoURL: result.user.photoURL
                        };

                        // If account was linked, show a success message
                        if (result.wasLinked) {
                            console.log('Anonymous account successfully linked with Google account');
                        }

                        // If anonymous progress was discarded, log it
                        if (result.anonymousProgressDiscarded) {
                            console.log('Anonymous progress was discarded due to conflict resolution');
                        }

                        // Update auth state with the user (not anonymous anymore)
                        dispatch(loginSuccess(user, false));
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
        // Show button if in debug mode or on localhost
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
                className={"px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors " + (debugMode ? '' : 'hidden')}
                title="Reset Progress">
                <span>Reset Progress</span>
            </button>);
    }

    function renderStatsButton() {
        return (
            <button
                onClick={() => navigate('/stats')}
                className="px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors"
                title="View Statistics">
                <span>Stats</span>
            </button>
        );
    }

    function renderGroupsButton() {
        return (
            <button
                onClick={() => navigate('/groups')}
                className="px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors"
                title="Manage Groups">
                <span>Groups</span>
            </button>
        );
    }

    function renderAdminModeLabel() {
        if (auth.isAdmin) {
            return (
                <div className="px-3 py-1 flex items-center gap-2 rounded bg-[#3c3c3c]">
                    <span className="text-[#9cdcfe]">Admin Mode</span>
                </div>
            );
        }
        return null;
    }

    function renderWatchActivityButton() {
        if (auth.isAdmin) {
            return (
                <button
                    onClick={() => navigate('/admin/activity')}
                    className="px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors"
                    title="Watch User Activity">
                    <span>Watch activity</span>
                </button>
            );
        }
        return null;
    }

    function renderNavigationButtons() {
        return (
            <>
                {renderStatsButton()}
                {renderGroupsButton()}
                {renderResetProgressButton()}
                {renderWatchActivityButton()}
                {renderAdminModeLabel()}
            </>
        );
    }

    return (
        <div className="flex items-center justify-between h-12 px-4 bg-[#252526] border-b border-[#3c3c3c]">
            <div
                className="text-lg font-medium cursor-pointer hover:text-[#9cdcfe]"
                onClick={() => navigate(debugMode ? '/?debug=false' : '/')}
            >
                Clean Code Game
            </div>
            <div className="flex gap-4">
                {(isMainPage || isCommunityLevelsPage) && renderNavigationButtons()}
                {auth.isAuthenticated && !auth.isAnonymous ? renderLogoutButton() : renderLoginButton()}
            </div>
        </div>
    );
}
