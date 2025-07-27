import React, {useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {GameStateContext} from '../reducers';
import {PlayerLevelStats} from '../types';
import {getLevelKey} from '../utils/levelUtils';

/**
 * Component for displaying player statistics
 */
export function PlayerStatsPage(): React.ReactElement {
    const context = useContext(GameStateContext);
    const navigate = useNavigate();

    if (!context) {
        throw new Error('PlayerStatsPage must be used within a GameStateContext Provider');
    }

    const {state} = context;
    const {playerStats, topics} = state;
    const {summary, levels} = playerStats;

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

    // Get level name from key
    const getLevelName = (levelKey: string): { topicName: string, levelName: string } => {
        const [topicName, levelId] = levelKey.split('__');
        return {
            topicName,
            levelName: `${levelId}.py`
        };
    };

    // Group levels by topic
    const levelsByTopic: Record<string, { levelName: string, stats: PlayerLevelStats }[]> = {};

    Object.entries(levels).forEach(([levelKey, stats]) => {
        const {topicName, levelName} = getLevelName(levelKey);

        if (!levelsByTopic[topicName]) {
            levelsByTopic[topicName] = [];
        }

        levelsByTopic[topicName].push({levelName, stats});
    });

    // Sort topics by their order in the game
    const sortedTopics = topics
        .filter(topic => topic.name !== "Testing")
        .map(topic => topic.name)
        .filter(topicName => levelsByTopic[topicName]);

    return (
        <div className="h-full overflow-y-auto p-6 bg-[#1e1e1e] text-white">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate('/')}
                    className="mr-4 px-3 py-1 rounded hover:bg-[#3c3c3c] transition-colors"
                >
                    ← Back to Game
                </button>
                <h1 className="text-2xl font-bold">Player Statistics</h1>
            </div>

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

                {sortedTopics.length === 0 ? (
                    <div className="text-gray-400">No levels completed yet.</div>
                ) : (
                    sortedTopics.map(topicName => (
                        <div key={topicName} className="mb-6">
                            <h3 className="text-lg font-medium mb-2">{topicName}</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr className="bg-[#2d2d2d]">
                                        <th className="p-2 text-left">Level</th>
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
                                    {levelsByTopic[topicName]
                                        .sort((a, b) => a.levelName.localeCompare(b.levelName))
                                        .map(({levelName, stats}) => (
                                            <tr key={levelName} className="border-b border-[#3c3c3c]">
                                                <td className="p-2">{levelName}</td>
                                                <td className="p-2 text-right">{stats.timesCompleted}</td>
                                                <td className="p-2 text-right">{formatTime(stats.totalTimeSpent)}</td>
                                                <td className="p-2 text-right">{formatTime(stats.minTimeSpent)}</td>
                                                <td className="p-2 text-right">{stats.totalHintsUsed}</td>
                                                <td className="p-2 text-right">{formatMinStat(stats.minHintsUsed)}</td>
                                                <td className="p-2 text-right">{stats.totalMistakesMade}</td>
                                                <td className="p-2 text-right">{formatMinStat(stats.minMistakesMade)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                )}

                {/* Add a section for levels that haven't been attempted yet */}
                <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Unplayed Levels</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="bg-[#2d2d2d]">
                                <th className="p-2 text-left">Topic</th>
                                <th className="p-2 text-left">Level</th>
                            </tr>
                            </thead>
                            <tbody>
                            {topics
                                .filter(topic => topic.name !== "Testing")
                                .map(topic =>
                                    topic.levels.map(level => {
                                        const levelKey = getLevelKey(topic.name, level.filename);
                                        if (!levels[levelKey]) {
                                            return (
                                                <tr key={`${topic.name}-${level.filename}`}
                                                    className="border-b border-[#3c3c3c]">
                                                    <td className="p-2">{topic.name}</td>
                                                    <td className="p-2">{level.filename}</td>
                                                </tr>
                                            );
                                        }
                                        return null;
                                    })
                                )
                                .flat()
                                .filter(Boolean)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}