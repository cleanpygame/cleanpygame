import React, {useContext, useState} from 'react';
import {GameStateContext} from '../reducer';
import {TopicItem} from './TopicItem';

/**
 * Sidebar navigation component showing topics and levels
 */
export function SidebarNavigationContainer(): React.ReactElement {
    const context = useContext(GameStateContext);

    if (!context) {
        throw new Error('SidebarNavigationContainer must be used within a GameStateContext Provider');
    }

    const {state, dispatch} = context;
    const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
        [state.currentLevelId.topic]: true
    });

    const toggleTopic = (topicName: string): void => {
        setExpandedTopics(prev => ({
            ...prev,
            [topicName]: !prev[topicName]
        }));
    };

    const handleLevelSelect = (topic: string, levelId: string): void => {
        dispatch({type: 'LOAD_LEVEL', payload: {levelId: {topic, levelId}}});
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

                {state.topics.length === 0 && (
                    <div className="p-2 text-[#888888]">Loading...</div>
                )}
            </div>
        </div>
    );
}