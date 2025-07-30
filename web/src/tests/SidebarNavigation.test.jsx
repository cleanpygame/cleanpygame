import {describe, expect, test, vi} from 'vitest';
import React from 'react';
import {render, screen} from '@testing-library/react';
import {SidebarNavigationContainer} from '../components/SidebarNavigationContainer.tsx';
import {GameStateContext} from '../reducers/index.ts';
import {isLevelClickable} from '../utils/levelUtils';
// Import state builder
import {createStateBuilder, mockDispatch} from './stateBuilder';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn()
}));

// Use the state builder to create mock state with completed level and custom topics
const mockState = createStateBuilder()
    .withCompletedLevel()
    .withCustomTopics([
        {
            name: 'topic1',
            levels: [
                {filename: 'level1.py', blocks: []},
                {filename: 'level2.py', blocks: []},
                {filename: 'level3.py', blocks: []}
            ]
        },
        {
            name: 'topic2',
            levels: [
                {filename: 'level1.py', blocks: []},
                {filename: 'level2.py', blocks: []}
            ]
        }
    ])
    .build();

describe('SidebarNavigationContainer', () => {
    test('renders topics and levels', () => {
        render(
            <GameStateContext.Provider value={{state: mockState, dispatch: mockDispatch}}>
                <SidebarNavigationContainer/>
            </GameStateContext.Provider>
        );

        // Check if topics are rendered
        expect(screen.getByText('topic1')).toBeDefined();
        expect(screen.getByText('topic2')).toBeDefined();

        // Check if levels are rendered (topic1 should be expanded by default)
        expect(screen.getByText('level1.py')).toBeDefined();
        expect(screen.getByText('level2.py')).toBeDefined();
        expect(screen.getByText('level3.py')).toBeDefined();
    });

    test('clickable levels follow the rules', () => {
        // Test the rules directly using the imported isLevelClickable function

        // Test the rules directly using the function
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

        // Now render the component to verify the UI reflects these rules
        render(
            <GameStateContext.Provider value={{state: mockState, dispatch: mockDispatch}}>
                <SidebarNavigationContainer/>
            </GameStateContext.Provider>
        );

        // Find level elements by their text content for topic1 (expanded by default)
        const level1 = screen.getByText('level1.py').closest('div');
        const level2 = screen.getByText('level2.py').closest('div');
        const level3 = screen.getByText('level3.py').closest('div');

        // Check CSS classes match the expected clickable state
        expect(level1.className).toContain('cursor-pointer');
        expect(level2.className).toContain('cursor-pointer');
        expect(level3.className).toContain('cursor-not-allowed');
    });
});