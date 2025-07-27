import {LevelId, LevelState} from '../types';
import {GameAction} from './actionCreators';
import {APPLY_FIX, NEXT_LEVEL, RESET_PROGRESS} from './actionTypes';

/**
 * Reducer for progress-related state (discovered wisdoms)
 * @param state - Current progress state
 * @param action - Action to perform
 * @param fullState - Full game state (for context)
 * @returns New progress state
 */
export function progressReducer(
    state: { discoveredWisdoms: string[] } = {discoveredWisdoms: []},
    action: GameAction,
    fullState: Partial<{
        currentLevel: LevelState | null;
        currentLevelId: LevelId;
    }> = {}
): { discoveredWisdoms: string[] } {
    switch (action.type) {
        case APPLY_FIX: {
            // We no longer need to update solvedLevels here
            // Level completion is tracked in playerStats.levels
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
                discoveredWisdoms: [
                    ...state.discoveredWisdoms,
                    ...newWisdoms
                ]
            };
        }

        case RESET_PROGRESS: {
            // Reset progress - only discoveredWisdoms now
            return {
                discoveredWisdoms: []
            };
        }

        default:
            return state;
    }
}
