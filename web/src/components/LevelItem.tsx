import React from 'react';
import {isCurrentLevel, isLevelClickable, isLevelSolved} from '../utils/levelUtils';
import {GameState, LevelData} from '../types';

interface LevelItemProps {
    state: GameState;
    level: LevelData;
    topicName: string;
    onLevelSelect: (topicName: string, levelId: string) => void;
}

/**
 * Component for rendering a single level item in the sidebar
 */
export function LevelItem({state, level, topicName, onLevelSelect}: LevelItemProps): React.ReactElement {
    const handleClick = (): void => {
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
            className={`flex items-center pl-4 p-1 ${
                levelClickable
                    ? `cursor-pointer ${
                        levelCurrent
                            ? 'bg-[#37373d]'
                            : ''
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