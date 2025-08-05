import React from 'react';
import {isCurrentLevel, isLevelClickable, isLevelSolved} from '../utils/levelUtils';
import {GameState, LevelData} from '../types';
import {renderToPyLevel} from '../utils/pylang';
import {getCurrentUser} from '../firebase/auth';
import {saveCustomLevel} from '../firebase/firestore';
import {useNavigate} from 'react-router-dom';

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
    const navigate = useNavigate();

    const handleClick = (): void => {
        if (isLevelClickable(state, topicName, level.filename)) {
            onLevelSelect(topicName, level.filename);
        }
    };

    const handleCloneToCommunity = async (e: React.MouseEvent): Promise<void> => {
        e.stopPropagation();
        try {
            const user = getCurrentUser();
            if (!user) {
                alert('You must be signed in to create a community level');
                return;
            }
            // Convert current level data to PyLevels format text
            const content = renderToPyLevel(level);
            if (!content) {
                alert('Failed to prepare level content');
                return;
            }
            // Save as a new custom community level
            const newLevelId = await saveCustomLevel(user, content, level.filename);
            // Navigate to the newly created level in the editor
            navigate(`/editor/${newLevelId}`);
        } catch (error) {
            console.error('Error cloning level to community:', error);
            alert('Failed to create community level. Please try again.');
        }
    };

    const levelClickable = isLevelClickable(state, topicName, level.filename);
    const levelCurrent = isCurrentLevel(state, topicName, level.filename);
    const levelSolved = isLevelSolved(state, topicName, level.filename);

    return (
        <div
            key={level.filename}
            className={`group flex items-center pl-4 p-1 ${
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
            <span className="flex-1">{level.filename}</span>
            {state.auth.isAdmin && (
                <div
                    className="px-2 cursor-pointer text-gray-400 hover:text-white invisible group-hover:visible"
                    onClick={handleCloneToCommunity}
                    title="Clone to community levels"
                >
                    <span>✎</span>
                </div>
            )}
        </div>
    );
}