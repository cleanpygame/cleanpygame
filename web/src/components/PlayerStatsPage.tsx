import React, {useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {GameStateContext} from '../reducers';
import {PlayerLevelStats, PlayerStatsState} from '../types';
import {getLevelKey} from '../utils/levelUtils';
import {createDefaultPlayerStats} from '../reducers/statsReducer';
import {getDoc} from 'firebase/firestore';
import {getPlayerDocRef} from '../firebase/firestore';

/**
 * Component for displaying player statistics
 */
export function PlayerStatsPage(): React.ReactElement {
    const context = useContext(GameStateContext);
    const navigate = useNavigate();
    const {uid} = useParams<{ uid?: string }>();
    const [userStats, setUserStats] = useState<PlayerStatsState | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!context) {
        throw new Error('PlayerStatsPage must be used within a GameStateContext Provider');
    }

    const {state} = context;
    const {playerStats, topics, userLevels, customLevels} = state;

    // State to store the user's display name
    const [userName, setUserName] = useState<string | null>(null);

    // If uid is provided, fetch that user's stats
    useEffect(() => {
        if (uid) {
            setIsLoading(true);
            setError(null);

            // Get a reference to the player's document
            const playerDocRef = getPlayerDocRef(uid);
            // Fetch the document
            getDoc(playerDocRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        // Create stats object from the document data
                        const stats: PlayerStatsState = {
                            summary: data.summary || createDefaultPlayerStats().summary,
                            levels: data.levels || {}
                        };
                        setUserStats(stats);
                        // Store the user's display name if available
                        setUserName(data.displayName || null);
                    } else {
                        setError('User stats not found');
                        setUserStats(createDefaultPlayerStats());
                    }
                })
                .catch((error) => {
                    console.error('Error fetching user stats:', error);
                    setError('Error fetching user stats');
                    setUserStats(createDefaultPlayerStats());
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [uid]);

    // Use the fetched stats if available, otherwise use the current user's stats
    const stats = uid && userStats ? userStats : playerStats;
    const {summary, levels} = stats;

    // Format time in minutes and seconds
    const formatTime = (seconds: number): string => {
        if (seconds === 0) return '0s';
        if (seconds === Number.MAX_SAFE_INTEGER) return '-';

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes === 0) {
            return `${remainingSeconds}s`;
        }

        return `${minutes}m ${remainingSeconds}s`;
    };

    // Format minimum stats
    const formatMinStat = (value: number): string => {
        return value === Number.MAX_SAFE_INTEGER ? '-' : value.toString();
    };

    // Aggregate stats helper
    const aggregateStats = (statsList: (PlayerLevelStats | undefined)[]) => {
        return statsList.reduce((acc: PlayerLevelStats, stat) => {
            if (!stat) return acc;
            acc.timesCompleted += stat.timesCompleted;
            acc.totalTimeSpent += stat.totalTimeSpent;
            acc.minTimeSpent += stat.minTimeSpent;
            acc.totalHintsUsed += stat.totalHintsUsed;
            acc.minHintsUsed += stat.minHintsUsed;
            acc.totalMistakesMade += stat.totalMistakesMade;
            acc.minMistakesMade += stat.minMistakesMade;
            return acc;
        }, {
            timesCompleted: 0,
            totalTimeSpent: 0,
            minTimeSpent: 0,
            totalHintsUsed: 0,
            minHintsUsed: 0,
            totalMistakesMade: 0,
            minMistakesMade: 0
        });
    };

    // Prepare topic data including all levels
    const baseTopicData = topics
        .filter(topic => topic.name !== 'Testing')
        .map(topic => {
            const levelData = topic.levels.map(level => {
                const levelKey = getLevelKey(topic.name, level.filename);
                const stats = levels[levelKey];
                return {levelName: level.filename, stats};
            });
            const aggregates = aggregateStats(levelData.map(l => l.stats));
            return {topicName: topic.name, levelData, aggregates};
        });

    // Prepare collaborative levels data
    const collaborativeLevels = userLevels.map(level => {
        const customLevel = customLevels[level.level_id];
        const levelName = customLevel?.filename || level.level_id;
        const levelKey = getLevelKey('community', level.level_id);
        const stats = levels[levelKey];
        return {levelName, stats};
    });
    const collaborativeAggregates = aggregateStats(collaborativeLevels.map(l => l.stats));

    const topicData = [
        ...baseTopicData,
        ...(collaborativeLevels.length > 0
            ? [{topicName: 'My Levels', levelData: collaborativeLevels, aggregates: collaborativeAggregates}]
            : [])
    ];

    // State for expanded topics
    const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
    const toggleTopic = (name: string) => {
        setExpandedTopics(prev => ({...prev, [name]: !prev[name]}));
    };

    return (
        <div className="h-full overflow-y-auto p-6 bg-[#1e1e1e] text-white">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => uid ? navigate(-1) : navigate('/')}
                    className="mr-4 px-3 py-1 rounded hover:bg-[#3c3c3c] transition-colors"
                >
                    ← {uid ? 'Back' : 'Back to Game'}
                </button>
                <h1 className="text-2xl font-bold">
                    {isLoading ? 'Loading Statistics...' :
                        uid ? `${userName ? userName + "'s" : "User"} Statistics` :
                            'My Statistics'}
                </h1>
            </div>

            {/* Loading indicator */}
            {isLoading && (
                <div className="bg-[#252526] p-4 rounded mb-6 flex justify-center">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="bg-[#252526] p-4 rounded mb-6 text-red-500">
                    <p>{error}</p>
                </div>
            )}

            {/* Summary Section */}
            <div className="bg-[#252526] p-4 rounded mb-6">
                <h2 className="text-xl font-semibold mb-4">Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#2d2d2d] p-3 rounded">
                        <div className="text-sm text-gray-400">Total Time Spent</div>
                        <div className="text-lg">{formatTime(summary.totalTimeSpent)}</div>
                    </div>
                    <div className="bg-[#2d2d2d] p-3 rounded">
                        <div className="text-sm text-gray-400">Levels Solved</div>
                        <div className="text-lg">{summary.totalLevelsSolved}</div>
                    </div>
                    <div className="bg-[#2d2d2d] p-3 rounded">
                        <div className="text-sm text-gray-400">Total Completions</div>
                        <div className="text-lg">{summary.totalLevelCompletions}</div>
                    </div>
                    <div className="bg-[#2d2d2d] p-3 rounded">
                        <div className="text-sm text-gray-400">Hints Used</div>
                        <div className="text-lg">{summary.totalHintsUsed}</div>
                    </div>
                    <div className="bg-[#2d2d2d] p-3 rounded">
                        <div className="text-sm text-gray-400">Mistakes Made</div>
                        <div className="text-lg">{summary.totalMistakesMade}</div>
                    </div>
                </div>
            </div>

            {/* Detailed Level Stats Section */}
            <div className="bg-[#252526] p-4 rounded">
                <h2 className="text-xl font-semibold mb-4">Level Progress</h2>

                {topicData.length === 0 ? (
                    <div className="text-gray-400">No levels available.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="text-gray-400">
                                <th className="p-2 text-left">Topic / Level</th>
                                <th className="p-2 text-right">Completions</th>
                                <th className="p-2 text-right">Total Time</th>
                                <th className="p-2 text-right">Best Time</th>
                                <th className="p-2 text-right">Total Hints</th>
                                <th className="p-2 text-right">Min Hints</th>
                                <th className="p-2 text-right">Total Mistakes</th>
                                <th className="p-2 text-right">Min Mistakes</th>
                            </tr>
                            </thead>
                            <tbody>
                            {topicData.map(topic => (
                                <React.Fragment key={topic.topicName}>
                                    <tr
                                        className="bg-[#2d2d2d] cursor-pointer"
                                        onClick={() => toggleTopic(topic.topicName)}
                                    >
                                        <td className="p-2">
                                            <span className="mr-2">{expandedTopics[topic.topicName] ? '▼' : '▶'}</span>
                                            {topic.topicName}
                                        </td>
                                        <td className="p-2 text-right">{topic.aggregates.timesCompleted}</td>
                                        <td className="p-2 text-right">{formatTime(topic.aggregates.totalTimeSpent)}</td>
                                        <td className="p-2 text-right">{formatTime(topic.aggregates.minTimeSpent)}</td>
                                        <td className="p-2 text-right">{topic.aggregates.totalHintsUsed}</td>
                                        <td className="p-2 text-right">{formatMinStat(topic.aggregates.minHintsUsed)}</td>
                                        <td className="p-2 text-right">{topic.aggregates.totalMistakesMade}</td>
                                        <td className="p-2 text-right">{formatMinStat(topic.aggregates.minMistakesMade)}</td>
                                    </tr>
                                    {expandedTopics[topic.topicName] && topic.levelData.map(({levelName, stats}) => (
                                        <tr key={levelName} className="border-t border-[#3c3c3c]">
                                            <td className="p-2 pl-8">{levelName}</td>
                                            {stats ? (
                                                <>
                                                    <td className="p-2 text-right">{stats.timesCompleted}</td>
                                                    <td className="p-2 text-right">{formatTime(stats.totalTimeSpent)}</td>
                                                    <td className="p-2 text-right">{formatTime(stats.minTimeSpent)}</td>
                                                    <td className="p-2 text-right">{stats.totalHintsUsed}</td>
                                                    <td className="p-2 text-right">{formatMinStat(stats.minHintsUsed)}</td>
                                                    <td className="p-2 text-right">{stats.totalMistakesMade}</td>
                                                    <td className="p-2 text-right">{formatMinStat(stats.minMistakesMade)}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="p-2 text-right">-</td>
                                                    <td className="p-2 text-right">-</td>
                                                    <td className="p-2 text-right">-</td>
                                                    <td className="p-2 text-right">-</td>
                                                    <td className="p-2 text-right">-</td>
                                                    <td className="p-2 text-right">-</td>
                                                    <td className="p-2 text-right">-</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}