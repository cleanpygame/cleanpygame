import React from 'react';
import {isCurrentLevel, isLevelClickable, isLevelSolved} from '../utils/levelUtils';

/**
 * Component for rendering a single level item in the sidebar
 *
 * @param {Object} props - Component props
 * @param {GameState} props.state - The game state
 * @param {LevelData} props.level - The level object
 * @param {string} props.topicName - The name of the topic this level belongs to
 * @param {Function} props.onLevelSelect - Function to call when level is selected
 */
export function LevelItem({state, level, topicName, onLevelSelect}) {
    const handleClick = () => {
        if (isLevelClickable(state, topicName, level.filename)) {
            onLevelSelect(topicName, level.filename);
        }
    };

    const levelClickable = isLevelClickable(state, topicName, level.filename);
    const levelCurrent = isCurrentLevel(state, topicName, level.filename);
    const levelSolved = isLevelSolved(state, topicName, level.filename);

    return (
        <div
            key={level.filename}
            className={`flex items-center p-1 rounded ${
                levelClickable
                    ? `cursor-pointer ${
                        levelCurrent
                            ? 'bg-[#37373d]'
                            : 'hover:bg-[#3c3c3c]'
                    }`
                    : 'cursor-not-allowed opacity-50'
            }`}
            onClick={handleClick}
        >
      <span className="mr-2">
        {levelSolved ? '✔️' : ' '}
      </span>
            <span>{level.filename}</span>
        </div>
    );
}