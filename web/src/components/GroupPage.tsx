import React, {useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {GameStateContext} from '../reducers';
import {formatDate} from '../utils/dateUtils';
import {
    deleteGroupThunk,
    fetchGroupByIdThunk,
    GameAction,
    toggleJoinCodeActiveThunk,
    updateGroupNameThunk
} from '../reducers/actionCreators';
import {GroupMember} from '../types';

// Helper function to execute thunks directly
type ThunkResult<T> = (dispatch: React.Dispatch<GameAction>, getState?: any) => Promise<T>;

// Function to execute a thunk and return its result as a Promise
function executeThunk<T>(thunk: ThunkResult<T>, dispatch: React.Dispatch<GameAction>, getState?: any): Promise<T> {
    return thunk(dispatch, getState);
}



/**
 * Group page component
 * Displays details for a specific group
 */
export function GroupPage(): React.ReactElement {
    const {groupId} = useParams<{ groupId: string }>();
    const context = useContext(GameStateContext);
    const navigate = useNavigate();
    const [isRenaming, setIsRenaming] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    if (!context) {
        throw new Error('GroupPage must be used within a GameStateContext Provider');
    }

    const {state, dispatch} = context;
    const {auth, selectedGroup, isGroupsLoading, groupsError} = state;

    // Fetch group data when component mounts
    useEffect(() => {
        if (groupId && auth.isAuthenticated) {
            executeThunk(fetchGroupByIdThunk(groupId), dispatch);
        }
    }, [groupId, auth.isAuthenticated, dispatch]);

    // Use the selectedGroup from state, or a loading placeholder if not loaded yet
    const group = selectedGroup || {
        id: groupId,
        name: 'Loading...',
        ownerUid: '',
        ownerName: '',
        ownerEmail: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deleted: false
    };

    // State for members
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [joinCode, setJoinCode] = useState<string>('');
    const [refreshingMember, setRefreshingMember] = useState<string | null>(null);
    const [refreshSuccess, setRefreshSuccess] = useState<string | null>(null);

    // Fetch members when the group is loaded
    useEffect(() => {
        if (group.id && group.id !== 'Loading...') {
            const groupId = group.id; // Store in a constant to satisfy TypeScript

            // Import the fetchGroupMembers function dynamically
            import('../firebase/firestore')
                .then(({fetchGroupMembers}) => {
                    // Fetch the members from Firestore
                    return fetchGroupMembers(groupId);
                })
                .then((fetchedMembers) => {
                    // Update the state with the fetched members
                    setMembers(fetchedMembers);
                })
                .catch((error) => {
                    console.error('Error fetching group members:', error);
                });

            // Fetch the join code for the group
            import('../firebase/firestore')
                .then(({fetchJoinCodesForGroup}) => {
                    // Fetch the join codes from Firestore
                    return fetchJoinCodesForGroup(groupId);
                })
                .then((joinCodes) => {
                    // Use the first active join code if available
                    const activeJoinCode = joinCodes.find(code => code.active);
                    if (activeJoinCode) {
                        setJoinCode(activeJoinCode.code);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching join codes:', error);
                });
        }
    }, [group.id]);

    const handleBackToGroups = () => {
        navigate('/groups');
    };

    const handleCreateInviteLink = () => {
        if (!groupId || !group.ownerUid) return;

        const ownerUid = group.ownerUid; // Store in a constant to satisfy TypeScript

        // Import the createJoinCode function dynamically
        import('../firebase/firestore')
            .then(({createJoinCode}) => {
                // Create a new join code for the group
                return createJoinCode(groupId, ownerUid);
            })
            .then((newJoinCode) => {
                // Update the join code state
                setJoinCode(newJoinCode);
                setIsLinkActive(true);

                // Show toast notification
                setShowToast(true);

                // Hide toast after 2 seconds
                setTimeout(() => {
                    setShowToast(false);
                }, 2000);
            })
            .catch((error) => {
                console.error('Error creating join code:', error);
            });
    };

    const [showToast, setShowToast] = React.useState(false);

    const handleCopyInviteLink = () => {
        if (!joinCode) return;
        
        // Construct the full invite URL using current page origin
        const fullInviteUrl = `${window.location.origin}/join/${joinCode}`;

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

    // Get the active state from Firestore
    const [isLinkActive, setIsLinkActive] = React.useState(true);

    // Fetch the join code active status when the join code is loaded
    useEffect(() => {
        if (joinCode) {
            // Import the getJoinCodeActiveStatus function dynamically
            import('../firebase/firestore')
                .then(({getJoinCodeActiveStatus}) => {
                    // Fetch the active status from Firestore
                    return getJoinCodeActiveStatus(joinCode);
                })
                .then((activeStatus) => {
                    // Update the state with the fetched active status
                    // If activeStatus is null (join code not found), default to false
                    setIsLinkActive(activeStatus !== null ? activeStatus : false);
                })
                .catch((error) => {
                    console.error('Error fetching join code active status:', error);
                    // In case of error, default to false
                    setIsLinkActive(false);
                });
        }
    }, [joinCode]);

    const handleToggleInviteLink = () => {
        if (!joinCode || !group.id) return;
        
        // Toggle the active state
        const newActiveState = !isLinkActive;
        const groupId = group.id; // Store in a constant to satisfy TypeScript

        // Update Firestore
        executeThunk(toggleJoinCodeActiveThunk(joinCode, newActiveState), dispatch)
            .then(() => {
                // Update local state
                setIsLinkActive(newActiveState);

                // Refresh join codes
                import('../firebase/firestore')
                    .then(({fetchJoinCodesForGroup}) => {
                        return fetchJoinCodesForGroup(groupId);
                    })
                    .then((joinCodes) => {
                        const activeJoinCode = joinCodes.find(code => code.active);
                        if (activeJoinCode) {
                            setJoinCode(activeJoinCode.code);
                        }
                    })
                    .catch((error) => {
                        console.error('Error refreshing join codes:', error);
                    });
            })
            .catch((error: Error) => {
                console.error('Failed to toggle invite link:', error);
            });
    };

    const handleRenameGroup = () => {
        // Set the current group name as the initial value
        setNewGroupName(group.name);
        // Show the rename input
        setIsRenaming(true);
    };

    const handleRenameSubmit = () => {
        if (!groupId || !newGroupName.trim()) return;

        // Update the group name in Firestore
        executeThunk(updateGroupNameThunk(groupId, newGroupName.trim()), dispatch, () => state)
            .then(() => {
                // Hide the rename input
                setIsRenaming(false);
            })
            .catch((error: Error) => {
                console.error('Failed to rename group:', error);
            });
    };

    const handleRenameCancel = () => {
        // Hide the rename input without saving
        setIsRenaming(false);
    };

    const handleDeleteGroup = () => {
        if (!groupId) return;

        // Add confirmation dialog
        const confirmDelete = window.confirm(`Are you sure you want to delete the group "${group.name}"? This action cannot be undone.`);

        if (confirmDelete) {
            // Use executeThunk to call the deleteGroupThunk
            executeThunk(deleteGroupThunk(groupId), dispatch)
                .then(() => {
                    // Handle success
                    console.log('Group deleted successfully');
                    navigate('/groups');
                })
                .catch((error: Error) => {
                    // Handle error
                    console.error('Failed to delete group:', error);
                    alert(`Failed to delete group: ${error.message}`);
                });
        }
    };

    const handleRefreshMemberStats = (memberId: string) => {
        if (!groupId) return;

        // Set the refreshing state
        setRefreshingMember(memberId);
        setRefreshSuccess(null);

        // Import the refreshMemberStats function dynamically
        import('../firebase/firestore')
            .then(({refreshMemberStats}) => {
                // Call the function to refresh the member's stats
                return refreshMemberStats(groupId, memberId);
            })
            .then(() => {
                // Handle success
                console.log(`Member ${memberId} stats refreshed successfully`);
                setRefreshSuccess(memberId);

                // Refresh the members list
                return import('../firebase/firestore')
                    .then(({fetchGroupMembers}) => {
                        return fetchGroupMembers(groupId);
                    });
            })
            .then((updatedMembers) => {
                // Update the members state with the refreshed data
                if (updatedMembers) {
                    setMembers(updatedMembers);
                }
            })
            .catch((error) => {
                // Handle error
                console.error('Failed to refresh member stats:', error);
                alert(`Failed to refresh member stats: ${error.message}`);
            })
            .finally(() => {
                // Clear the refreshing state after a delay
                setTimeout(() => {
                    setRefreshingMember(null);

                    // Clear the success state after a few seconds
                    setTimeout(() => {
                        setRefreshSuccess(null);
                    }, 3000);
                }, 500);
            });
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

    // Show loading state
    if (isGroupsLoading && !selectedGroup) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="bg-[#333333] p-6 rounded-lg shadow-md">
                    <p className="text-lg mb-4">Loading group details...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (groupsError) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="bg-[#333333] p-6 rounded-lg shadow-md">
                    <p className="text-lg mb-4">Error loading group details:</p>
                    <p className="text-red-500">{groupsError}</p>
                    <button
                        onClick={handleBackToGroups}
                        className="mt-4 px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                    >
                        Back to Groups
                    </button>
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
                    {isRenaming ? (
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className="bg-[#222] text-sm p-2 rounded mr-2 w-64"
                                placeholder="Enter new group name"
                                autoFocus
                            />
                            <button
                                onClick={handleRenameSubmit}
                                className="p-1 rounded bg-green-600 hover:bg-green-700 transition-colors mr-1"
                                title="Save"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </button>
                            <button
                                onClick={handleRenameCancel}
                                className="p-1 rounded bg-red-600 hover:bg-red-700 transition-colors"
                                title="Cancel"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold mr-2">{group.name}</h1>
                            <button
                                onClick={handleRenameGroup}
                                className="p-1 rounded hover:bg-[#3c3c3c] transition-colors"
                                title="Rename Group"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                     fill="none"
                                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar with group info */}
                <div className="md:col-span-1">
                    <div className="bg-[#333333] p-4 rounded-lg shadow-md mb-4">
                        <h2 className="text-lg font-semibold mb-3">Group Info</h2>
                        <div className="mb-2">
                            <p className="text-sm text-gray-400">Created</p>
                            <p>{formatDate(group.createdAt)}</p>
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
                                    value={joinCode || 'No active code'}
                                    readOnly
                                    className="bg-[#222] text-sm p-2 rounded w-32 mr-2"
                                />
                                <div className="relative">
                                    <button
                                        onClick={handleCopyInviteLink}
                                        className="p-2 bg-[#444] rounded hover:bg-[#555] transition-colors mr-2"
                                        title="Copy code"
                                        disabled={!joinCode}
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
                                            {joinCode ? 'Copied' : 'Created new code'}
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
                                            disabled={!joinCode}
                                        />
                                        <div
                                            className={`relative w-11 h-6 ${!joinCode ? 'bg-gray-800' : 'bg-gray-600'} rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}
                                            title={!joinCode ? "No active code" : (isLinkActive ? "Link is Active" : "Link is Inactive")}
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
                                        <th className="text-left p-2">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {members.map(member => (
                                        <tr key={member.uid} className="border-b border-[#444] hover:bg-[#3a3a3a]">
                                            <td className="p-2">{member.displayName}</td>
                                            <td className="p-2">{member.levelsCompleted || 0}</td>
                                            <td className="p-2">{member.totalTimeSpent || 0}s</td>
                                            <td className="p-2">{member.totalHintsUsed || 0}</td>
                                            <td className="p-2">{member.totalWrongClicks || 0}</td>
                                            <td className="p-2">{member.lastPlayedAt ? formatDate(member.lastPlayedAt) : 'Never'}</td>
                                            <td className="p-2">{formatDate(member.joinedAt)}</td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => handleRefreshMemberStats(member.uid)}
                                                    className={`p-1 rounded ${refreshSuccess === member.uid ? 'bg-green-600' : 'bg-blue-600'} hover:bg-blue-700 transition-colors`}
                                                    title="Refresh stats from player data"
                                                    disabled={refreshingMember === member.uid}
                                                >
                                                    {refreshingMember === member.uid ? (
                                                        <div
                                                            className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                                                    ) : refreshSuccess === member.uid ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                             viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                             strokeWidth="2" strokeLinecap="round"
                                                             strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                             viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                             strokeWidth="2" strokeLinecap="round"
                                                             strokeLinejoin="round">
                                                            <path
                                                                d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"></path>
                                                        </svg>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                    <tfoot>
                                    <tr className="bg-[#2a2a2a]">
                                        <td className="p-2 font-medium">Total</td>
                                        <td className="p-2">
                                            {members.reduce((sum, m) => sum + (m.levelsCompleted || 0), 0)}
                                        </td>
                                        <td className="p-2">
                                            {members.reduce((sum, m) => sum + (m.totalTimeSpent || 0), 0)}s
                                        </td>
                                        <td className="p-2">
                                            {members.reduce((sum, m) => sum + (m.totalHintsUsed || 0), 0)}
                                        </td>
                                        <td className="p-2">
                                            {members.reduce((sum, m) => sum + (m.totalWrongClicks || 0), 0)}
                                        </td>
                                        <td className="p-2"></td>
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