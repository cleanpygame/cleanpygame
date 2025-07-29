import React, {useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {GameStateContext} from '../reducers';
import {loadLevel} from '../reducers/actionCreators';
import {TopicItem} from './TopicItem';
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

    const toggleTopic = (topicName: string): void => {
        setExpandedTopics(prev => ({
            ...prev,
            [topicName]: !prev[topicName]
        }));
    };

    const handleLevelSelect = (topic: string, levelId: string): void => {
        dispatch(loadLevel({topic, levelId}));
    };

    const handleCreateNewLevel = (): void => {
        navigate('/editor');
    };

    return (
        <div className="w-50 h-full overflow-y-auto bg-[#252526] border-r border-[#3c3c3c]">
            <div className={`p-2`}>
                <h1 className="text-m font-light">EXPLORER</h1>
            </div>
            <div className="text-sm">
                {state.topics.filter(t => t.name != "Testing").map((topic) => (
                    <TopicItem
                        key={topic.name}
                        state={state}
                        topic={topic}
                        isExpanded={expandedTopics[topic.name] || false}
                        onToggle={toggleTopic}
                        onLevelSelect={handleLevelSelect}
                    />
                ))}

                {/* My Levels topic - only shown in debug mode */}
                {isDebugModeEnabled() && (
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
                                {/* Create New button */}
                                <div
                                    className="flex items-center pl-4 p-1 cursor-pointer hover:bg-[#37373d]"
                                    onClick={handleCreateNewLevel}
                                >
                                    <span className="mr-2">+</span>
                                    <span>Create New</span>
                                </div>

                                {/* Render My Levels here when implemented */}
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
