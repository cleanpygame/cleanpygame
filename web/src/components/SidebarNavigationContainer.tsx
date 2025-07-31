import React, {useContext, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {GameStateContext} from '../reducers';
import {loadLevel, setCustomLevels, setUserLevels} from '../reducers/actionCreators';
import {TopicItem} from './TopicItem';
import {onAuthStateChanged} from '../firebase/auth';
import {getCustomLevelById, getUserLevels} from '../firebase/firestore';
import {CustomLevel} from '../types';
import {isDebugModeEnabled} from '../utils/debugUtils';

/**
 * Sidebar navigation component showing topics and levels
 */
export function SidebarNavigationContainer(): React.ReactElement {
    const context = useContext(GameStateContext);
    const navigate = useNavigate();

    if (!context) {
        throw new Error('SidebarNavigationContainer must be used within a GameStateContext Provider');
    }

    const {state, dispatch} = context;
    const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
        [state.currentLevelId.topic]: true,
        'My Levels': true // Always expand My Levels topic
    });

    // Fetch user levels when auth state changes (user logs in/out)
    useEffect(() => {
        const fetchUserLevels = async (user: any) => {
            if (user) {
                try {
                    const levels = await getUserLevels(user.uid);
                    if (levels) {
                        dispatch(setUserLevels(levels));

                        // Fetch custom level details for each level_id
                        const levelDetails: Record<string, CustomLevel> = {};
                        await Promise.all(levels.map(async (level) => {
                            try {
                                const customLevel = await getCustomLevelById(level.level_id);
                                if (customLevel) {
                                    levelDetails[level.level_id] = customLevel;
                                }
                            } catch (error) {
                                console.error(`Error fetching custom level ${level.level_id}:`, error);
                            }
                        }));

                        dispatch(setCustomLevels(levelDetails));
                    }
                } catch (error) {
                    console.error('Error fetching user levels:', error);
                }
            } else {
                // User is logged out, clear user levels and custom levels
                dispatch(setUserLevels([]));
                dispatch(setCustomLevels({}));
            }
        };

        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(fetchUserLevels);

        // Clean up listener when component unmounts
        return () => unsubscribe();
    }, []); // No dependencies to prevent flickering when switching topics

    const toggleTopic = (topicName: string): void => {
        setExpandedTopics(prev => ({
            ...prev,
            [topicName]: !prev[topicName]
        }));
    };

    const handleLevelSelect = (topic: string, levelId: string): void => {
        dispatch(loadLevel({topic, levelId}));
        // Reset URL path to root after loading standard level
        navigate('/');
    };

    const handleCreateNewLevel = (): void => {
        navigate('/editor');
    };

    const handleEditLevel = (levelId: string): void => {
        navigate(`/editor/${levelId}`);
    };
    return (
        <div className="w-50 h-full overflow-y-auto bg-[#252526] border-r border-[#3c3c3c]">
            <div className={`p-2`}>
                <h1 className="text-m font-light">EXPLORER</h1>
            </div>
            <div className="text-sm">
                {state.topics.filter(topic => {
                    // Filter out Testing topic
                    if (topic.name === "Testing") return false;

                    // Filter out topics with inDevelopment: true unless in debug mode or user is admin
                    if (topic.inDevelopment) {
                        return isDebugModeEnabled() || state.auth.isAdmin;
                    }

                    // Show all other topics
                    return true;
                }).map((topic) => (
                    <TopicItem
                        key={topic.name}
                        state={state}
                        topic={topic}
                        isExpanded={expandedTopics[topic.name] || false}
                        onToggle={toggleTopic}
                        onLevelSelect={handleLevelSelect}
                    />
                ))}

                {/* My Levels topic - only show when user is authenticated */}
                {state.auth.isAuthenticated && (
                    <div className="">
                        <div
                            className="flex items-center p-1 cursor-pointer"
                            onClick={() => toggleTopic('My Levels')}
                        >
                            <span className="mr-1 font-mono">
                              {expandedTopics['My Levels'] ? '-' : '+'}
                            </span>
                            <span>My Levels</span>
                        </div>

                        {expandedTopics['My Levels'] && (
                            <div>
                                {/* Render user levels */}
                                {state.userLevels.map((level) => {
                                    const customLevel = state.customLevels[level.level_id];
                                    return (
                                        <div
                                            key={level.level_id}
                                            className={`flex items-center pl-4 p-1 hover:bg-[#37373d] ${
                                                state.currentLevelId.topic === 'community' &&
                                                state.currentLevelId.levelId === level.level_id
                                                    ? 'bg-[#37373d]'
                                                    : ''
                                            }`}
                                        >
                                            <div
                                                className="flex-1 cursor-pointer"
                                                onClick={() => navigate(`/community-levels/${level.level_id}`)}
                                            >
                                                <span>{customLevel?.filename || level.level_id}</span>
                                            </div>
                                            <div
                                                className="px-2 cursor-pointer text-gray-400 hover:text-white"
                                                onClick={() => handleEditLevel(level.level_id)}
                                                title="Edit level"
                                            >
                                                <span>✎</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Create New button */}
                                <div
                                    className="flex items-center pl-4 p-1 cursor-pointer hover:bg-[#37373d]"
                                    onClick={handleCreateNewLevel}
                                >
                                    <span className="underline text-gray-400">Create level</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {state.topics.length === 0 && (
                    <div className="p-2 text-[#888888]">Loading...</div>
                )}
            </div>
        </div>
    );
}
