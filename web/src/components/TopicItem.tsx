import React from 'react';
import {LevelItem} from './LevelItem';
import {GameState, Topic} from '../types';

interface TopicItemProps {
    state: GameState;
    topic: Topic;
    isExpanded: boolean;
    onToggle: (topicName: string) => void;
    onLevelSelect: (topicName: string, levelId: string) => void;
}

/**
 * Component for rendering a single topic item with its levels in the sidebar
 */
export function TopicItem({state, topic, isExpanded, onToggle, onLevelSelect}: TopicItemProps): React.ReactElement {
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