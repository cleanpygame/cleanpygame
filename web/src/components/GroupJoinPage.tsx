import React, {useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {GameStateContext} from '../reducers';
import {signInWithGoogle} from '../firebase/auth';
import {
    fetchGroupByJoinCodeThunk,
    joinGroupThunk,
    loginFailure,
    loginRequest,
    loginSuccess
} from '../reducers/actionCreators';

/**
 * GroupJoinPage component
 * Handles the group join flow
 */
export function GroupJoinPage(): React.ReactElement {
    const {code} = useParams<{ code: string }>();
    const context = useContext(GameStateContext);
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isJoining, setIsJoining] = useState(false);

    if (!context) {
        throw new Error('GroupJoinPage must be used within a GameStateContext Provider');
    }

    const {state, dispatch} = context;
    const {auth, selectedGroup} = state;

    // Fetch group data when component mounts
    useEffect(() => {
        if (!code) {
            setError('Invalid join code');
            setIsLoading(false);
            return;
        }

        const fetchGroup = async () => {
            try {
                await fetchGroupByJoinCodeThunk(code)(dispatch);
                setIsLoading(false);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'An unknown error occurred');
                setIsLoading(false);
            }
        };

        fetchGroup();
    }, [code, dispatch]);

    // Set initial display name from user profile when authenticated
    useEffect(() => {
        if (auth.isAuthenticated && auth.user?.displayName) {
            setDisplayName(auth.user.displayName);
        }
    }, [auth.isAuthenticated, auth.user]);

    const handleJoinGroup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedGroup) {
            setError('Group not found');
            return;
        }

        if (!auth.isAuthenticated) {
            setError('You must be logged in to join a group');
            return;
        }

        if (!displayName.trim()) {
            setError('Display name cannot be empty');
            return;
        }

        setIsJoining(true);
        setError(null);

        try {
            await joinGroupThunk(selectedGroup.id, displayName.trim())(dispatch, () => state);
            // Navigate to success page
            navigate(`/join/${code}/success`);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
            setIsJoining(false);
        }
    };

    const handleBackToGame = () => {
        navigate('/');
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#2d2d2d] text-[#d4d4d4] flex items-center justify-center">
                <div className="bg-[#333333] p-8 rounded-lg shadow-lg max-w-md w-full">
                    <div className="flex justify-center">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="text-center mt-4">Loading group information...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error || !selectedGroup) {
        return (
            <div className="min-h-screen bg-[#2d2d2d] text-[#d4d4d4] flex items-center justify-center">
                <div className="bg-[#333333] p-8 rounded-lg shadow-lg max-w-md w-full">
                    <h1 className="text-xl font-semibold mb-4">Unable to Join Group</h1>
                    <p className="mb-4 text-red-400">{error || 'Group not found or join code is inactive'}</p>
                    <button
                        onClick={handleBackToGame}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Back to Game
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#2d2d2d] text-[#d4d4d4] flex items-center justify-center">
            <div className="bg-[#333333] p-8 rounded-lg shadow-lg max-w-md w-full">
                <h1 className="text-xl font-semibold mb-2">Join Group</h1>
                <div className="mb-6">
                    <h2 className="text-lg font-medium">{selectedGroup.name}</h2>
                    <p className="text-sm text-gray-400">
                        Created
                        by {selectedGroup.ownerName}
                    </p>
                </div>

                {!auth.isAuthenticated ? (
                    <div>
                        <p className="mb-4">You need to sign in to join this group.</p>
                        <button
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
                                        dispatch(loginSuccess(user));

                                        // Set the display name from the user profile
                                        if (user.displayName) {
                                            setDisplayName(user.displayName);
                                        }
                                    }
                                } catch (error) {
                                    dispatch(loginFailure(error instanceof Error ? error.message : 'An unknown error occurred'));
                                    setError(error instanceof Error ? error.message : 'Failed to sign in with Google');
                                }
                            }}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={auth.isLoading}
                        >
                            {auth.isLoading ? 'Signing in...' : 'Sign in with Google'}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleJoinGroup}>
                        <div className="mb-4">
                            <label htmlFor="displayName" className="block text-sm font-medium mb-1">
                                Your Display Name
                            </label>
                            <input
                                type="text"
                                id="displayName"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full p-2 bg-[#222] border border-[#444] rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your display name"
                                disabled={isJoining}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                This name along with your progress will be visible to the group owner.
                            </p>
                        </div>

                        {error && (
                            <div
                                className="mb-4 p-2 bg-red-900 bg-opacity-25 border border-red-700 rounded text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleBackToGame}
                                className="px-4 py-2 bg-[#444] rounded hover:bg-[#555] transition-colors"
                                disabled={isJoining}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                                disabled={isJoining}
                            >
                                {isJoining ? 'Joining...' : 'Join Group'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}