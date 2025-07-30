import {beforeEach, describe, expect, test, vi} from 'vitest';
import {isLevelClickable} from '../utils/levelUtils';
import {GameState, LevelData} from '../types';
// Import the mocked function
import {isDebugModeEnabled} from '../utils/debugUtils';

// Mock the debugUtils module
vi.mock('../utils/debugUtils', () => ({
    isDebugModeEnabled: vi.fn(),
    setDebugMode: vi.fn()
}));

function createLevel(filename: string): LevelData {
    return {
        filename: filename,
        blocks: []
    };
}

// Mock state for testing
const mockState: GameState = {
    topics: [
        {
            name: 'topic1',
            levels: [
                createLevel('level1.py'),
                createLevel('level2.py'),
                createLevel('level3.py')
            ],
        },
        {
            name: 'topic2',
            levels: [
                createLevel('level1.py'),
                createLevel('level2.py'),
            ],
        }
    ],
    currentLevelId: {topic: 'topic1', levelId: 'level1.py'},
    chatMessages: [],
    isTypingAnimationComplete: true,
    auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isAdmin: false
    },
    playerStats: {
        summary: {
            totalTimeSpent: 0,
            totalLevelsSolved: 1,
            totalLevelCompletions: 1,
            totalHintsUsed: 0,
            totalMistakesMade: 0
        },
        levels: {
            'topic1__level1': {
                timesCompleted: 1,
                totalTimeSpent: 60,
                totalHintsUsed: 0,
                totalMistakesMade: 0,
                minTimeSpent: 60,
                minHintsUsed: 0,
                minMistakesMade: 0
            }
        }
    },
    ownedGroups: [],
    joinedGroups: [],
    isGroupsLoading: false,
    userLevels: [],
    customLevels: {},
    currentLevel: {
        level: createLevel('level1.py'),
        triggeredEvents: [],
        pendingHintId: null,
        code: '',
        isFinished: false,
        regions: [],
        startTime: Date.now(),
        sessionHintsUsed: 0,
        sessionMistakesMade: 0
    }
};

describe('levelUtils with debug mode', () => {
    beforeEach(() => {
        // Reset the mock
        vi.resetAllMocks();
    });

    test('isLevelClickable follows normal rules when debug mode is disabled', () => {
        // Mock debug mode disabled
        (isDebugModeEnabled as any).mockReturnValue(false);

        // Rule 1: All solved levels are clickable (topic1/level1.py)
        expect(isLevelClickable(mockState, 'topic1', 'level1.py')).toBe(true);

        // Rule 2: First level in each topic is clickable (topic1/level1.py, topic2/level1.py)
        expect(isLevelClickable(mockState, 'topic2', 'level1.py')).toBe(true);

        // Rule 3: Next level after any solved level is clickable (topic1/level2.py)
        expect(isLevelClickable(mockState, 'topic1', 'level2.py')).toBe(true);

        // topic1/level3.py - Should not be clickable (not first, not after solved)
        expect(isLevelClickable(mockState, 'topic1', 'level3.py')).toBe(false);

        // topic2/level2.py - Should not be clickable (not first, not after solved)
        expect(isLevelClickable(mockState, 'topic2', 'level2.py')).toBe(false);
    });

    test('isLevelClickable allows all levels when debug mode is enabled', () => {
        // Mock debug mode enabled
        (isDebugModeEnabled as any).mockReturnValue(true);

        // All levels should be clickable in debug mode
        expect(isLevelClickable(mockState, 'topic1', 'level1.py')).toBe(true);
        expect(isLevelClickable(mockState, 'topic1', 'level2.py')).toBe(true);
        expect(isLevelClickable(mockState, 'topic1', 'level3.py')).toBe(true);
        expect(isLevelClickable(mockState, 'topic2', 'level1.py')).toBe(true);
        expect(isLevelClickable(mockState, 'topic2', 'level2.py')).toBe(true);
    });
});