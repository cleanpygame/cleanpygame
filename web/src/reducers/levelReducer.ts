import {LevelData, LevelState, Topic} from '../types';
import {GameAction} from './actionCreators';
import {APPLY_FIX, GET_HINT, LOAD_LEVEL, WRONG_CLICK} from './actionTypes';
import {applyEvents} from '../utils/pylang';


/**
 * Calculate new triggered events
 * @param currentEvents - Current triggered events
 * @param newEventId - New event ID to add
 * @returns Updated triggered events array
 */
export const calculateNewTriggeredEvents = (currentEvents: string[], newEventId: string): string[] => {
    return currentEvents.includes(newEventId)
        ? currentEvents
        : [...currentEvents, newEventId];
};


/**
 * Check if all issues are fixed in a level
 * @param blocks - Level blocks
 * @param triggeredEvents - Currently triggered events
 * @param eventId - Current event ID
 * @returns True if all issues are fixed
 */
export const checkAllIssuesFixed = (
    blocks: LevelData['blocks'],
    triggeredEvents: string[],
    eventId: string
): boolean => {
    return blocks
        .filter(block => block.event && block.type !== 'neutral')
        .every(block => triggeredEvents.includes(block.event || '') || eventId === block.event);
};

/**
 * Reducer for level-related state
 * @param state - Current level state
 * @param action - Action to perform
 * @param topics - Levels description
 * @returns New level state
 */
export function levelReducer(
    state: LevelState | null,
    action: GameAction,
    topics: Topic[] = []
): LevelState | null {
    if (!state && action.type !== LOAD_LEVEL) return null;

    switch (action.type) {
        case LOAD_LEVEL: {
            const {levelId} = action.payload;

            // Find the level data
            const topic = topics.find(t => t.name === levelId.topic);
            if (!topic) return state;

            const levelData = topic.levels.find((l: any) => l.filename === levelId.levelId);
            if (!levelData) return state;

            // Create an initial level state
            return createInitialLevelState(levelData);
        }

        case APPLY_FIX: {
            if (!state) return null;

            const {eventId} = action.payload;

            // Calculate new triggered events
            const triggeredEvents = calculateNewTriggeredEvents(
                state.triggeredEvents,
                eventId
            );

            // Calculate next hint ID
            const nextHintId = calculateNextHintId(state.level, triggeredEvents);

            // Update code and regions with applyEvents
            const {code, regions} = applyEvents(state.level.blocks, triggeredEvents);

            // Check if all issues are fixed
            const allIssuesFixed = checkAllIssuesFixed(
                state.level.blocks,
                triggeredEvents,
                eventId
            );

            return {
                ...state,
                code,
                regions,
                triggeredEvents,
                isFinished: allIssuesFixed,
                pendingHintId: nextHintId,
            };
        }

        case GET_HINT: {
            if (!state) return null;

            return {
                ...state,
                pendingHintId: null,
                sessionHintsUsed: state.sessionHintsUsed + 1 // Increment hints used in this session
            };
        }

        case WRONG_CLICK: {
            if (!state) return null;

            // Increment mistakes made in this session
            return {
                ...state,
                sessionMistakesMade: state.sessionMistakesMade + 1
            };
        }

        default:
            return state;
    }
}

/**
 * Find the next hint ID based on triggered events
 * @param levelData - Level data
 * @param triggeredEvents - Events already triggered
 * @returns Next hint ID or null
 */
export const calculateNextHintId = (levelData: LevelData, triggeredEvents: string[]): string | null => {
    // Find the first block with a hint that hasn't been triggered yet
    const blockWithHint = levelData.blocks.find(
        block => block.hint && block.event && !triggeredEvents.includes(block.event || '')
    );

    return blockWithHint?.event || null;
};

/**
 * Creates initial level state with zero progress
 * @param levelData - Data for the level
 * @returns Initial level state
 */
export const createInitialLevelState = (levelData: LevelData): LevelState => {
    const {code, regions} = applyEvents(levelData.blocks, []);
    return {
        level: levelData,
        triggeredEvents: [],
        pendingHintId: calculateNextHintId(levelData, []),
        code,
        regions,
        isFinished: false,
        startTime: Date.now(),           // Initialize with current timestamp
        sessionHintsUsed: 0,             // Initialize with zero hints used
        sessionMistakesMade: 0,          // Initialize with zero mistakes made
    };
};