import {LevelId, LevelState} from '../types';
import {GameAction} from './actionCreators';
import {APPLY_FIX, NEXT_LEVEL, RESET_PROGRESS} from './actionTypes';

/**
 * Check if a level is already solved
 * @param solvedLevels - List of solved levels
 * @param currentLevelId - Current level ID
 * @returns True if the level is already solved
 */
const isLevelSolved = (solvedLevels: LevelId[], currentLevelId: LevelId): boolean => {
    return solvedLevels.some(
        level => level.topic === currentLevelId.topic && level.levelId === currentLevelId.levelId
    );
};

/**
 * Reducer for progress-related state (solved levels and discovered wisdoms)
 * @param state - Current progress state
 * @param action - Action to perform
 * @param fullState - Full game state (for context)
 * @returns New progress state
 */
export function progressReducer(
    state: { solvedLevels: LevelId[], discoveredWisdoms: string[] } = {solvedLevels: [], discoveredWisdoms: []},
    action: GameAction,
    fullState: Partial<{
        currentLevel: LevelState | null;
        currentLevelId: LevelId;
    }> = {}
): { solvedLevels: LevelId[], discoveredWisdoms: string[] } {
    switch (action.type) {
        case APPLY_FIX: {
            const {currentLevel, currentLevelId} = fullState;

            if (!currentLevel || !currentLevelId) return state;

            // Check if all issues are fixed
            const allIssuesFixed = currentLevel.isFinished;

            // Add the current level to solved levels if all issues are fixed
            if (allIssuesFixed) {
                // Check if the level is already solved
                if (isLevelSolved(state.solvedLevels, currentLevelId)) {
                    return state;
                }

                // Add the level to solved levels
                return {
                    ...state,
                    solvedLevels: [...state.solvedLevels, currentLevelId]
                };
            }

            return state;
        }

        case NEXT_LEVEL: {
            const {currentLevel} = fullState;

            if (!currentLevel) return state;

            // Add current level wisdoms to discovered wisdoms
            const newWisdoms = currentLevel.level.wisdoms.filter(
                w => !state.discoveredWisdoms.includes(w)
            );

            if (newWisdoms.length === 0) {
                return state;
            }

            return {
                ...state,
                discoveredWisdoms: [
                    ...state.discoveredWisdoms,
                    ...newWisdoms
                ]
            };
        }

        case RESET_PROGRESS: {
            // Reset progress
            return {
                solvedLevels: [],
                discoveredWisdoms: []
            };
        }

        default:
            return state;
    }
}
