import React, {useContext} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {GameStateContext} from '../reducers';

/**
 * Group page component
 * Displays details for a specific group
 */
export function GroupPage(): React.ReactElement {
    const {groupId} = useParams<{ groupId: string }>();
    const context = useContext(GameStateContext);
    const navigate = useNavigate();

    if (!context) {
        throw new Error('GroupPage must be used within a GameStateContext Provider');
    }

    const {state} = context;
    const {auth} = state;

    // Placeholder for group data
    const group = {
        id: groupId,
        name: 'Sample Group',
        ownerUid: 'owner123',
        ownerName: 'Teacher Name',
        ownerEmail: 'teacher@example.com',
        joinCode: 'ABC12345',
        memberIds: [],
        memberSummaries: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false,
        isActive: true // Added active state for the join link
    };

    // Placeholder for members data
    const members: any[] = [];

    const handleBackToGroups = () => {
        navigate('/groups');
    };

    const handleCreateInviteLink = () => {
        // This will be implemented later
        console.log('Create invite link clicked');
    };

    const [showToast, setShowToast] = React.useState(false);

    const handleCopyInviteLink = () => {
        // Construct the full invite URL using current page origin
        const fullInviteUrl = `${window.location.origin}/join/${group.joinCode}`;

        // Copy to clipboard
        navigator.clipboard.writeText(fullInviteUrl)
            .then(() => {
                // Show toast notification
                setShowToast(true);

                // Hide toast after 2 seconds
                setTimeout(() => {
                    setShowToast(false);
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    const [isLinkActive, setIsLinkActive] = React.useState(group.isActive);

    const handleToggleInviteLink = () => {
        // Toggle the active state
        const newActiveState = !isLinkActive;
        setIsLinkActive(newActiveState);

        // This would normally update the backend
        console.log(`Toggle invite link to ${newActiveState ? 'active' : 'inactive'}`);
    };

    const handleRenameGroup = () => {
        // This will be implemented later
        console.log('Rename group clicked');
    };

    const handleDeleteGroup = () => {
        // This will be implemented later
        console.log('Delete group clicked');
        navigate('/groups');
    };

    if (!auth.isAuthenticated) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="bg-[#333333] p-6 rounded-lg shadow-md">
                    <p className="text-lg mb-4">You need to be logged in to view group details.</p>
                    <p>Please log in using the button in the top right corner.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Toast notification is now handled inline next to the copy button */}

            <div className="flex items-center mb-6">
                <button
                    onClick={handleBackToGroups}
                    className="mr-4 px-3 py-1 rounded hover:bg-[#3c3c3c] transition-colors"
                >
                    ← Back to Groups
                </button>
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold mr-2">{group.name}</h1>
                    <button
                        onClick={handleRenameGroup}
                        className="p-1 rounded hover:bg-[#3c3c3c] transition-colors"
                        title="Rename Group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar with group info */}
                <div className="md:col-span-1">
                    <div className="bg-[#333333] p-4 rounded-lg shadow-md mb-4">
                        <h2 className="text-lg font-semibold mb-3">Group Info</h2>
                        <div className="mb-2">
                            <p className="text-sm text-gray-400">Created</p>
                            <p>{new Date(group.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-400">Members</p>
                            <p>{members.length}</p>
                        </div>

                        <div className="border-t border-[#444] pt-4 mb-4">
                            <h3 className="font-medium mb-2">Invite Links</h3>
                            <div className="flex items-center mb-2">
                                <input
                                    type="text"
                                    value={group.joinCode}
                                    readOnly
                                    className="bg-[#222] text-sm p-2 rounded w-32 mr-2"
                                />
                                <div className="relative">
                                    <button
                                        onClick={handleCopyInviteLink}
                                        className="p-2 bg-[#444] rounded hover:bg-[#555] transition-colors mr-2"
                                        title="Copy code"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                             viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                             strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    </button>
                                    {showToast && (
                                        <div
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-50">
                                            Copied
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isLinkActive}
                                            onChange={handleToggleInviteLink}
                                            className="sr-only peer"
                                        />
                                        <div
                                            className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                                            title={isLinkActive ? "Link is Active" : "Link is Inactive"}
                                        ></div>
                                    </label>
                                </div>
                            </div>
                            <button
                                onClick={handleCreateInviteLink}
                                className="w-full text-sm px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors mt-2"
                            >
                                Create New Link
                            </button>
                        </div>

                        <div className="border-t border-[#444] pt-4">
                            <h3 className="font-medium mb-2">Group Actions</h3>
                            <button
                                onClick={handleDeleteGroup}
                                className="w-full text-sm px-3 py-1 bg-red-700 rounded hover:bg-red-800 transition-colors"
                            >
                                Delete Group
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main content with members table */}
                <div className="md:col-span-3">
                    <div className="bg-[#333333] p-4 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-4">Members</h2>

                        {members.length === 0 ? (
                            <div className="p-4 bg-[#2a2a2a] rounded">
                                <p>No members have joined this group yet.</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Share the invite link to allow students to join.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b border-[#444]">
                                        <th className="text-left p-2">Name</th>
                                        <th className="text-left p-2">Levels Completed</th>
                                        <th className="text-left p-2">Total Time</th>
                                        <th className="text-left p-2">Hints Used</th>
                                        <th className="text-left p-2">Mistakes</th>
                                        <th className="text-left p-2">Last Active</th>
                                        <th className="text-left p-2">Joined</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {members.map(member => (
                                        <tr key={member.id} className="border-b border-[#444] hover:bg-[#3a3a3a]">
                                            <td className="p-2">{member.displayName}</td>
                                            <td className="p-2">{member.stats?.levelsCompleted || 0}</td>
                                            <td className="p-2">{member.stats?.totalTimeSpent || 0}s</td>
                                            <td className="p-2">{member.stats?.hintsUsed || 0}</td>
                                            <td className="p-2">{member.stats?.mistakesMade || 0}</td>
                                            <td className="p-2">{member.lastActive ? new Date(member.lastActive).toLocaleDateString() : 'Never'}</td>
                                            <td className="p-2">{new Date(member.joinedAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot>
                                    <tr className="bg-[#2a2a2a]">
                                        <td className="p-2 font-medium">Total</td>
                                        <td className="p-2">
                                            {members.reduce((sum, m) => sum + (m.stats?.levelsCompleted || 0), 0)}
                                        </td>
                                        <td className="p-2">
                                            {members.reduce((sum, m) => sum + (m.stats?.totalTimeSpent || 0), 0)}s
                                        </td>
                                        <td className="p-2">
                                            {members.reduce((sum, m) => sum + (m.stats?.hintsUsed || 0), 0)}
                                        </td>
                                        <td className="p-2">
                                            {members.reduce((sum, m) => sum + (m.stats?.mistakesMade || 0), 0)}
                                        </td>
                                        <td className="p-2"></td>
                                        <td className="p-2"></td>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}