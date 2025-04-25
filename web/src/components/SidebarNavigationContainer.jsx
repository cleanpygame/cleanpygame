import React, {useContext, useState} from 'react';
import {GameStateContext} from '../reducer.js';
import {TopicItem} from './TopicItem';

/**
 * Sidebar navigation component showing topics and levels
 */
export function SidebarNavigationContainer() {
  const { state, dispatch } = useContext(GameStateContext);
  const [expandedTopics, setExpandedTopics] = useState({[state.currentLevelId.topic]: true });

  const toggleTopic = (topicName) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicName]: !prev[topicName]
    }));
  };

  const handleLevelSelect = (topic, levelId) => {
    dispatch({type: 'LOAD_LEVEL', payload: {levelId: {topic, levelId}}});
  };

  return (
    <div className="w-50 h-full overflow-y-auto bg-[#252526] border-r border-[#3c3c3c]">
      <div className="p-2 text-sm font-mono">
        {state.topics.map((topic) => (
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
          <div className="p-2 text-[#888888]">Loading topics...</div>
        )}
      </div>
    </div>
  );
}
