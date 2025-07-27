import React, {useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {GameStateContext} from '../reducers';

/**
 * Groups page component
 * Displays a list of groups owned by the user and groups the user has joined
 */
export function GroupsPage(): React.ReactElement {
    const context = useContext(GameStateContext);
    const navigate = useNavigate();

    if (!context) {
        throw new Error('GroupsPage must be used within a GameStateContext Provider');
    }

    const {state} = context;
    const {auth} = state;

    // Placeholder for groups data
    const ownedGroups: any[] = [];
    const joinedGroups: any[] = [];

    const handleCreateGroup = () => {
        // This will be implemented later
        console.log('Create group clicked');
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
                    >
                        Create Group
                    </button>
                )}
            </div>

            {!auth.isAuthenticated ? (
                <div className="bg-[#333333] p-6 rounded-lg shadow-md">
                    <p className="text-lg mb-4">You need to be logged in to manage groups.</p>
                    <p>Please log in using the button in the top right corner.</p>
                </div>
            ) : (
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
                                            <span>{group.memberIds?.length || 0} members</span>
                                            <span>Created: {new Date(group.createdAt).toLocaleDateString()}</span>
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
                                        onClick={() => handleGroupClick(group.id)}
                                        className="bg-[#333333] p-4 rounded-lg shadow-md cursor-pointer hover:bg-[#3c3c3c] transition-colors"
                                    >
                                        <h3 className="text-lg font-medium mb-2">{group.name}</h3>
                                        <div className="flex justify-between text-sm text-gray-400">
                                            <span>Owner: {group.ownerName}</span>
                                            <span>Joined: {new Date(group.joinedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}