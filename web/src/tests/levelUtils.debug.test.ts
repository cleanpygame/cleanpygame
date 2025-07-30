import {beforeEach, describe, expect, test, vi} from 'vitest';
import {isLevelClickable} from '../utils/levelUtils';
import {GameState} from '../types';
// Import the mocked function
import {isDebugModeEnabled} from '../utils/debugUtils';
// Import state builder
import {createStateBuilder} from './stateBuilder';

// Mock the debugUtils module
vi.mock('../utils/debugUtils', () => ({
    isDebugModeEnabled: vi.fn(),
    setDebugMode: vi.fn()
}));

// Use the state builder to create mock state with completed level
const mockState: GameState = createStateBuilder()
    .withCompletedLevel()
    .build();

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