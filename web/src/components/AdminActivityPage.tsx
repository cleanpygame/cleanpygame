import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {GameStateContext} from '../reducers';
import {formatDate} from '../utils/dateUtils';
import {UserActivity} from '../types';
import {fetchRecentlyActiveUsers} from '../firebase/firestore';

/**
 * Admin Activity Page component
 * Displays recent user activity for admin users
 */
export function AdminActivityPage(): React.ReactElement {
    const context = useContext(GameStateContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    if (!context) {
        throw new Error('AdminActivityPage must be used within a GameStateContext Provider');
    }

    const {state} = context;
    const {auth} = state;

    // Fetch recently active users when component mounts
    useEffect(() => {
        if (auth.isAuthenticated && auth.isAdmin) {
            setIsLoading(true);
            setError(null);

            fetchRecentlyActiveUsers(50)
                .then((activeUsers) => {
                    console.log(activeUsers)
                    setUsers(activeUsers);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.error('Error fetching active users:', err);
                    setError('Failed to load user activity data. Please try again later.');
                    setIsLoading(false);
                });
        }
    }, [auth.isAuthenticated, auth.isAdmin]);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleUserClick = (userId: string) => {
        // Navigate to the specific user's stats page
        navigate(`/stats/${userId}`);
    };

    // If user is not authenticated or not an admin, this should be handled by AdminRoute
    // But we'll add a check here as well for safety
    if (!auth.isAuthenticated || !auth.isAdmin) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="bg-[#333333] p-6 rounded-lg shadow-md">
                    <p className="text-lg mb-4">You don't have permission to view this page.</p>
                    <button
                        onClick={handleBackToHome}
                        className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="bg-[#333333] p-6 rounded-lg shadow-md">
                    <p className="text-lg mb-4">Loading user activity data...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="bg-[#333333] p-6 rounded-lg shadow-md">
                    <p className="text-lg mb-4">Error loading user activity data:</p>
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={handleBackToHome}
                        className="mt-4 px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center mb-6">
                <button
                    onClick={handleBackToHome}
                    className="mr-4 px-3 py-1 rounded hover:bg-[#3c3c3c] transition-colors"
                >
                    ← Back to Home
                </button>
                <h1 className="text-2xl font-bold">Recent User Activity</h1>
            </div>

            <div className="bg-[#333333] p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">Last {users.length} Active Users</h2>

                {users.length === 0 ? (
                    <div className="p-4 bg-[#2a2a2a] rounded">
                        <p>No user activity data available.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-[#444]">
                                <th className="text-left p-2">Name</th>
                                <th className="text-left p-2">Email</th>
                                <th className="text-left p-2">Levels Completed</th>
                                <th className="text-left p-2">Total Levels Played</th>
                                <th className="text-left p-2">Total Time</th>
                                <th className="text-left p-2">Hints Used</th>
                                <th className="text-left p-2">Mistakes</th>
                                <th className="text-left p-2">Last Active</th>
                                <th className="text-left p-2">First Seen</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map(user => (
                                <tr
                                    key={user.uid}
                                    className="border-b border-[#444] hover:bg-[#3a3a3a] cursor-pointer"
                                    onClick={() => handleUserClick(user.uid)}
                                >
                                    <td className="p-2">{user.displayName}</td>
                                    <td className="p-2">{user.email}</td>
                                    <td className="p-2">{user.totalLevelCompletions || 0}</td>
                                    <td className="p-2">{user.totalLevelsSolved || 0}</td>
                                    <td className="p-2">{user.totalTimeSpent || 0}s</td>
                                    <td className="p-2">{user.totalHintsUsed || 0}</td>
                                    <td className="p-2">{user.totalMistakesMade || 0}</td>
                                    <td className="p-2"
                                        title={user.lastPlayedAt ? formatDate(user.lastPlayedAt, 'Never', true) : 'Never'}>
                                        {user.lastPlayedAt ? formatDate(user.lastPlayedAt) : 'Never'}
                                    </td>
                                    <td className="p-2"
                                        title={user.createdAt ? formatDate(user.createdAt, 'N/A', true) : 'N/A'}>
                                        {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                            <tfoot>
                            <tr className="bg-[#2a2a2a]">
                                <td className="p-2 font-medium">Total</td>
                                <td className="p-2"></td>
                                <td className="p-2">
                                    {users.reduce((sum, u) => sum + (u.totalLevelCompletions || 0), 0)}
                                </td>
                                <td className="p-2">
                                    {users.reduce((sum, u) => sum + (u.totalLevelsSolved || 0), 0)}
                                </td>
                                <td className="p-2">
                                    {users.reduce((sum, u) => sum + (u.totalTimeSpent || 0), 0)}s
                                </td>
                                <td className="p-2">
                                    {users.reduce((sum, u) => sum + (u.totalHintsUsed || 0), 0)}
                                </td>
                                <td className="p-2">
                                    {users.reduce((sum, u) => sum + (u.totalMistakesMade || 0), 0)}
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
    );
}