import {beforeEach, describe, expect, test, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {TopBar} from '../components/TopBar';
import {GameStateContext} from '../reducers';
import {BrowserRouter} from 'react-router-dom';
import {parseDebugModeFromUrl} from '../utils/debugUtils';
// Import state builder
import {createStateBuilder, mockDispatch} from './stateBuilder';

// Mock the debugUtils module
vi.mock('../utils/debugUtils', () => ({
    isDebugModeEnabled: vi.fn(),
    parseDebugModeFromUrl: vi.fn(),
    setDebugMode: vi.fn()
}));

// Use the state builder to create mock state
const mockState = createStateBuilder().build();

// Helper function to render TopBar with context and specified pathname
const renderTopBar = (pathname: string) => {
    // Mock location.pathname
    Object.defineProperty(window, 'location', {
        value: {
            pathname: pathname,
            hostname: 'example.com',
            search: ''
        },
        writable: true
    });

    return render(
        <BrowserRouter>
            <GameStateContext.Provider value={{state: mockState, dispatch: mockDispatch}}>
                <TopBar/>
            </GameStateContext.Provider>
        </BrowserRouter>
    );
};

describe('TopBar navigation buttons visibility', () => {
    beforeEach(() => {
        // Reset mocks
        vi.resetAllMocks();

        // Mock parseDebugModeFromUrl to return false by default
        (parseDebugModeFromUrl as any).mockReturnValue(false);
    });

    test('Navigation buttons are visible on the main page', () => {
        renderTopBar('/');

        // Check that Stats button is visible
        const statsButton = screen.getByText('Stats');
        expect(statsButton).toBeDefined();

        // Check that Groups button is visible
        const groupsButton = screen.getByText('Groups');
        expect(groupsButton).toBeDefined();
    });

    test('Navigation buttons are visible on the community levels page', () => {
        renderTopBar('/community-levels/some-level-id');

        // Check that Stats button is visible
        const statsButton = screen.getByText('Stats');
        expect(statsButton).toBeDefined();

        // Check that Groups button is visible
        const groupsButton = screen.getByText('Groups');
        expect(groupsButton).toBeDefined();
    });

    test('Navigation buttons are not visible on other pages', () => {
        renderTopBar('/stats');

        // Stats and Groups buttons should not be visible
        const statsButton = screen.queryByText('Stats');
        const groupsButton = screen.queryByText('Groups');

        expect(statsButton).toBeNull();
        expect(groupsButton).toBeNull();
    });
});