import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {GameStateContext} from '../reducers';
import {createGroupThunk, fetchGroupsThunk} from '../reducers/actionCreators';
import {formatDate} from '../utils/dateUtils';


/**
 * Groups page component
 * Displays a list of groups owned by the user and groups the user has joined
 */
export function GroupsPage(): React.ReactElement {
    const context = useContext(GameStateContext);
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!context) {
        throw new Error('GroupsPage must be used within a GameStateContext Provider');
    }

    const {state, dispatch} = context;
    const {auth, ownedGroups, joinedGroups, isGroupsLoading, groupsError} = state;

    // Fetch groups when the component mounts or auth status changes
    useEffect(() => {
        if (auth.isAuthenticated) {
            const fetchGroups = async () => {
                try {
                    // Call the thunk function directly and pass dispatch
                    await fetchGroupsThunk()(dispatch, () => state);
                } catch (error) {
                    console.error('Error fetching groups:', error);
                }
            };

            fetchGroups();
        }
    }, [auth.isAuthenticated, dispatch]);

    const handleCreateGroup = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setGroupName('');
        setError(null);
    };

    const handleSubmitCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!groupName.trim()) {
            setError('Group name cannot be empty');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            // Call the thunk function directly and pass dispatch
            const group = await createGroupThunk(groupName.trim())(dispatch, () => state);
            handleCloseModal();
            // Navigate to the new group page
            navigate(`/groups/${group.id}`);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsCreating(false);
        }
    };

    const handleGroupClick = (groupId: string) => {
        navigate(`/groups/${groupId}`);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/')}
                        className="mr-4 px-3 py-1 rounded hover:bg-[#3c3c3c] transition-colors"
                    >
                        ← Back to Game
                    </button>
                    <h1 className="text-2xl font-bold">Groups</h1>
                </div>
                {auth.isAuthenticated && (
                    <button
                        onClick={handleCreateGroup}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        disabled={isGroupsLoading}
                    >
                        Create Group
                    </button>
                )}
            </div>

            {/* Create Group Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#333333] p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">Create a New Group</h2>

                        <form onSubmit={handleSubmitCreateGroup}>
                            <div className="mb-4">
                                <label htmlFor="groupName" className="block text-sm font-medium mb-1">
                                    Group Name
                                </label>
                                <input
                                    type="text"
                                    id="groupName"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full p-2 bg-[#222] border border-[#444] rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter group name"
                                    disabled={isCreating}
                                    autoFocus
                                />
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
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 bg-[#444] rounded hover:bg-[#555] transition-colors"
                                    disabled={isCreating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    disabled={isCreating}
                                >
                                    {isCreating ? 'Creating...' : 'Create Group'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {!auth.isAuthenticated ? (
                <div className="bg-[#333333] p-6 rounded-lg shadow-md">
                    <p className="text-lg mb-4">You need to be logged in to manage groups.</p>
                    <p>Please log in using the button in the top right corner.</p>
                </div>
            ) : (
                <>
                    {/* Display error if there is one */}
                    {groupsError && (
                        <div className="mb-4 p-4 bg-red-900 bg-opacity-25 border border-red-700 rounded text-red-400">
                            Error loading groups: {groupsError}
                        </div>
                    )}

                    {/* Loading state */}
                    {isGroupsLoading && (
                        <div className="flex justify-center items-center p-8">
                            <div
                                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    )}

                    {!isGroupsLoading && (
                        <>
                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Groups You Own</h2>
                                {ownedGroups.length === 0 ? (
                                    <div className="bg-[#333333] p-6 rounded-lg shadow-md">
                                        <p>You don't own any groups yet. Create a group to get started.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {ownedGroups.map(group => (
                                            <div
                                                key={group.id}
                                                onClick={() => handleGroupClick(group.id)}
                                                className="bg-[#333333] p-4 rounded-lg shadow-md cursor-pointer hover:bg-[#3c3c3c] transition-colors"
                                            >
                                                <h3 className="text-lg font-medium mb-2">{group.name}</h3>
                                                <div className="flex justify-between text-sm text-gray-400">
                                                    <span>{group.memberCount || 0} members</span>
                                                    <span>Created: {formatDate(group.createdAt)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold mb-4">Groups You've Joined</h2>
                                {joinedGroups.length === 0 ? (
                                    <div className="bg-[#333333] p-6 rounded-lg shadow-md">
                                        <p>You haven't joined any groups yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {joinedGroups.map(group => (
                                            <div
                                                key={group.id}
                                                className="bg-[#333333] p-4 rounded-lg shadow-md"
                                            >
                                                <h3 className="text-lg font-medium mb-2">{group.name}</h3>
                                                <div className="flex justify-between text-sm text-gray-400">
                                                    <span>Owner: {group.ownerName}</span>
                                                    <span>Joined: {formatDate(group.joinedAt || group.createdAt)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </>
            )}
        </div>
    );
}