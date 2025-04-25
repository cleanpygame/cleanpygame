import React from 'react';
import {LevelItem} from './LevelItem';

/**
 * Component for rendering a single topic item with its levels in the sidebar
 *
 * @param {Object} props - Component props
 * @param {GameState} props.state - The game state
 * @param {Topic} props.topic - The topic object
 * @param {boolean} props.isExpanded - Whether the topic is expanded
 * @param {Function} props.onToggle - Function to call when topic is toggled
 * @param {Function} props.onLevelSelect - Function to call when a level is selected
 */
export function TopicItem({state, topic, isExpanded, onToggle, onLevelSelect}) {
    return (
        <div className="mb-2">
            <div
                className="flex items-center p-1 rounded cursor-pointer hover:bg-[#3c3c3c]"
                onClick={() => onToggle(topic.name)}
            >
        <span className="mr-1">
          {isExpanded ? '-' : '+'}
        </span>
                <span>{topic.name}</span>
            </div>

            {isExpanded && (
                <div className="ml-4 mt-1">
                    {topic.levels.map((level) => (
                        <LevelItem
                            key={level.filename}
                            state={state}
                            level={level}
                            topicName={topic.name}
                            onLevelSelect={onLevelSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}