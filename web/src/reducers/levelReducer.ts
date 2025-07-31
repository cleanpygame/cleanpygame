import {LevelData, LevelState, Topic} from '../types';
import {GameAction} from './actionCreators';
import {APPLY_FIX, GET_HINT, LOAD_COMMUNITY_LEVEL, LOAD_LEVEL, WRONG_CLICK} from './actionTypes';
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
        .every(block => {
            // Check if the block's event is triggered
            if (Array.isArray(block.event)) {
                // If block.event is an array, check if any of the events in the array are in the triggeredEvents list
                // or if eventId matches any of the events in the array
                return block.event.some(e => triggeredEvents.includes(e) || eventId === e);
            } else if (block.event) {
                // If block.event is a string, check if it's in the triggeredEvents list
                // or if eventId matches the event
                return triggeredEvents.includes(block.event) || eventId === block.event;
            } else {
                return false;
            }
        });
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
    if (!state && action.type !== LOAD_LEVEL && action.type !== LOAD_COMMUNITY_LEVEL) return null;

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

        case LOAD_COMMUNITY_LEVEL: {
            const {levelData} = action.payload;

            // Create an initial level state directly from the provided level data
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
        block => block.hint && block.event && !isEventTriggered(block.event, triggeredEvents)
    );

    // If the block has an event array, return the first event in the array
    // Otherwise, return the event as is
    if (blockWithHint?.event) {
        return Array.isArray(blockWithHint.event) ? blockWithHint.event[0] : blockWithHint.event;
    }

    return null;
};

/**
 * Helper function to check if an event is triggered
 * @param event - Event ID or array of event IDs
 * @param triggeredEvents - List of triggered event IDs
 * @returns True if the event is triggered
 */
function isEventTriggered(event: string | string[] | undefined, triggeredEvents: string[]): boolean {
    if (!event) return false;

    if (Array.isArray(event)) {
        // If event is an array, check if any of the events in the array are in the triggeredEvents list
        return event.some(e => triggeredEvents.includes(e));
    } else {
        // If event is a string, check if it's in the triggeredEvents list
        return triggeredEvents.includes(event);
    }
}

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