import {beforeEach, describe, expect, test, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {TopBar} from '../components/TopBar';
import {GameStateContext} from '../reducers';
import {BrowserRouter} from 'react-router-dom';
// Import the mocked functions
import {isDebugModeEnabled, parseDebugModeFromUrl} from '../utils/debugUtils';

// Mock the debugUtils module
vi.mock('../utils/debugUtils', () => ({
    isDebugModeEnabled: vi.fn(),
    parseDebugModeFromUrl: vi.fn(),
    setDebugMode: vi.fn()
}));

// Mock state for testing
const mockState = {
    topics: [],
    currentLevelId: {topic: 'topic1', levelId: 'level1.py'},
    currentLevel: {
        level: {
            filename: 'level1.py',
            wisdoms: [],
            blocks: []
        },
        triggeredEvents: [],
        pendingHintId: null,
        code: '',
        isFinished: false,
        regions: [],
        startTime: Date.now(),
        sessionHintsUsed: 0,
        sessionMistakesMade: 0
    },
    discoveredWisdoms: [],
    notebookOpen: false,
    chatMessages: [],
    isTypingAnimationComplete: true,
    auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
    },
    playerStats: {
        summary: {
            totalTimeSpent: 0,
            totalLevelsSolved: 0,
            totalLevelCompletions: 0,
            totalHintsUsed: 0,
            totalMistakesMade: 0
        },
        levels: {}
    },
    ownedGroups: [],
    joinedGroups: [],
    isGroupsLoading: false
};

const mockDispatch = vi.fn();

// Helper function to render TopBar with context
const renderTopBar = () => {
    return render(
        <BrowserRouter>
            <GameStateContext.Provider value={{state: mockState, dispatch: mockDispatch}}>
                <TopBar/>
            </GameStateContext.Provider>
        </BrowserRouter>
    );
};

describe('TopBar with debug mode', () => {
    beforeEach(() => {
        // Reset mocks
        vi.resetAllMocks();

        // Mock location.pathname to be root path (main page)
        Object.defineProperty(window, 'location', {
            value: {
                pathname: '/',
                hostname: 'example.com', // Not localhost
                search: ''
            },
            writable: true
        });

        // Mock parseDebugModeFromUrl to return false by default
        (parseDebugModeFromUrl as any).mockReturnValue(false);
    });

    test('Reset Progress button is hidden when debug mode is disabled', () => {
        // Mock debug mode disabled
        (isDebugModeEnabled as any).mockReturnValue(false);
        (parseDebugModeFromUrl as any).mockReturnValue(false);

        // Mock hostname to not be localhost
        Object.defineProperty(window, 'location', {
            value: {
                pathname: '/',
                hostname: 'example.com', // Not localhost
                search: ''
            },
            writable: true
        });

        renderTopBar();

        // Reset Progress button should not be visible
        // Note: The button might still be in the DOM but hidden with CSS
        const resetButton = screen.queryByText('Reset Progress');
        if (resetButton) {
            const buttonElement = resetButton.closest('button');
            expect(buttonElement?.className).toContain('hidden');
        } else {
            // If the button is not in the DOM at all, that's also acceptable
            expect(resetButton).toBeNull();
        }
    });

    test('Reset Progress button is visible when debug mode is enabled', () => {
        // Mock debug mode enabled
        (isDebugModeEnabled as any).mockReturnValue(true);
        (parseDebugModeFromUrl as any).mockReturnValue(true);

        renderTopBar();

        // Reset Progress button should be visible
        const resetButton = screen.getByText('Reset Progress');
        expect(resetButton).toBeDefined();
        const buttonElement = resetButton.closest('button');
        expect(buttonElement).not.toBeNull();
        expect(buttonElement?.className).not.toContain('hidden');
    });

    test('Clean Code Game title is clickable', () => {
        renderTopBar();

        // Find the title
        const title = screen.getByText('Clean Code Game');

        // Check that it has the cursor-pointer class
        expect(title.className).toContain('cursor-pointer');
    });

    test('parseDebugModeFromUrl is called on component mount', () => {
        renderTopBar();

        // Check that parseDebugModeFromUrl was called
        expect(parseDebugModeFromUrl).toHaveBeenCalled();
    });
});