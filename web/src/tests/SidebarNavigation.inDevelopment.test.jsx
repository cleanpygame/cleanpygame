import {describe, expect, test, vi, beforeEach} from 'vitest';
import React from 'react';
import {render, screen} from '@testing-library/react';
import {SidebarNavigationContainer} from '../components/SidebarNavigationContainer.tsx';
import {GameStateContext} from '../reducers/index.ts';
import {createStateBuilder, mockDispatch} from './stateBuilder';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn()
}));

// Mock debugUtils
vi.mock('../utils/debugUtils', () => ({
    isDebugModeEnabled: vi.fn()
}));

// Import the mocked function
import {isDebugModeEnabled} from '../utils/debugUtils';

describe('SidebarNavigationContainer with inDevelopment topics', () => {
    // Reset mocks before each test
    beforeEach(() => {
        vi.resetAllMocks();
    });

    // Create mock state with regular and inDevelopment topics
    const createMockState = (isAdmin = false) => {
        const builder = createStateBuilder()
            .withCustomTopics([
                {
                    name: 'Regular Topic',
                    levels: [
                        {filename: 'level1.py', blocks: []}
                    ]
                },
                {
                    name: 'Development Topic',
                    levels: [
                        {filename: 'dev-level1.py', blocks: []}
                    ],
                    inDevelopment: true
                }
            ]);
            
        // Set admin status if needed
        if (isAdmin) {
            return builder.asAdmin().build();
        } else {
            return builder.asAuthenticatedUser(false).build();
        }
    };

    test('regular topics are always visible', () => {
        // Mock debug mode disabled
        isDebugModeEnabled.mockReturnValue(false);
        
        const mockState = createMockState(false); // Not admin
        
        render(
            <GameStateContext.Provider value={{state: mockState, dispatch: mockDispatch}}>
                <SidebarNavigationContainer/>
            </GameStateContext.Provider>
        );

        // Regular topic should be visible
        expect(screen.getByText('Regular Topic')).toBeDefined();
    });

    test('inDevelopment topics are hidden for normal users when debug mode is disabled', () => {
        // Mock debug mode disabled
        isDebugModeEnabled.mockReturnValue(false);
        
        const mockState = createMockState(false); // Not admin
        
        render(
            <GameStateContext.Provider value={{state: mockState, dispatch: mockDispatch}}>
                <SidebarNavigationContainer/>
            </GameStateContext.Provider>
        );

        // Development topic should be hidden
        expect(screen.queryByText('Development Topic')).toBeNull();
    });

    test('inDevelopment topics are visible when debug mode is enabled', () => {
        // Mock debug mode enabled
        isDebugModeEnabled.mockReturnValue(true);
        
        const mockState = createMockState(false); // Not admin
        
        render(
            <GameStateContext.Provider value={{state: mockState, dispatch: mockDispatch}}>
                <SidebarNavigationContainer/>
            </GameStateContext.Provider>
        );

        // Development topic should be visible
        expect(screen.getByText('Development Topic')).toBeDefined();
    });

    test('inDevelopment topics are visible for admin users even when debug mode is disabled', () => {
        // Mock debug mode disabled
        isDebugModeEnabled.mockReturnValue(false);
        
        const mockState = createMockState(true); // Admin user
        
        render(
            <GameStateContext.Provider value={{state: mockState, dispatch: mockDispatch}}>
                <SidebarNavigationContainer/>
            </GameStateContext.Provider>
        );

        // Development topic should be visible for admin
        expect(screen.getByText('Development Topic')).toBeDefined();
    });
});