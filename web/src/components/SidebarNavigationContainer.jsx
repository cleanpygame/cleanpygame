import { useContext, useState } from 'react';
import { GameStateContext } from '../reducer.js';

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
    dispatch({
      type: 'LOAD_LEVEL',
      payload: { levelId: { topic, levelId } }
    });
  };
  
  const isLevelSolved = (topic, levelId) => {
    return state.solvedLevels.some(
      level => level.topic === topic && level.levelId === levelId
    );
  };
  
  const isCurrentLevel = (topic, levelId) => {
    return (
      state.currentLevelId &&
      state.currentLevelId.topic === topic &&
      state.currentLevelId.levelId === levelId
    );
  };

  return (
    <div className="w-50 h-full overflow-y-auto bg-[#252526] border-r border-[#3c3c3c]">
      <div className="p-2 text-sm">
        {state.topics.map((topic) => (
          <div key={topic.name} className="mb-2">
            <div
              className="flex items-center p-1 rounded cursor-pointer hover:bg-[#3c3c3c]"
              onClick={() => toggleTopic(topic.name)}
            >
              <span className="mr-1">
                {expandedTopics[topic.name] ? '▼' : '▶'}
              </span>
              <span>{topic.name}</span>
            </div>
            
            {expandedTopics[topic.name] && (
              <div className="ml-4 mt-1">
                {topic.levels.map((level) => (
                  <div
                    key={level.filename}
                    className={`flex items-center p-1 rounded cursor-pointer ${
                      isCurrentLevel(topic.name, level.filename)
                        ? 'bg-[#37373d]'
                        : 'hover:bg-[#3c3c3c]'
                    }`}
                    onClick={() => handleLevelSelect(topic.name, level.filename)}
                  >
                    <span className="mr-2">
                      {isLevelSolved(topic.name, level.filename) ? '✅' : '📄'}
                    </span>
                    <span>{level.filename}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {state.topics.length === 0 && (
          <div className="p-2 text-[#888888]">Loading topics...</div>
        )}
      </div>
    </div>
  );
}
