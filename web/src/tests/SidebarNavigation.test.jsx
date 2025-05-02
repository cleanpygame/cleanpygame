import {describe, expect, test, vi} from 'vitest';
import React from 'react';
import {render, screen} from '@testing-library/react';
import {SidebarNavigationContainer} from '../components/SidebarNavigationContainer.jsx';
import {GameStateContext} from '../reducers/index.ts';

// Mock state for testing
const mockState = {
    topics: [
        {
            name: 'topic1',
            levels: [
                {filename: 'level1.py', title: 'Level 1'},
                {filename: 'level2.py', title: 'Level 2'},
                {filename: 'level3.py', title: 'Level 3'}
            ]
        },
        {
            name: 'topic2',
            levels: [
                {filename: 'level1.py', title: 'Level 1'},
                {filename: 'level2.py', title: 'Level 2'}
            ]
        }
    ],
    currentLevelId: {topic: 'topic1', levelId: 'level1.py'},
    solvedLevels: [
        {topic: 'topic1', levelId: 'level1.py'}
    ]
};

const mockDispatch = vi.fn();

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

    // test('clickable levels follow the rules', () => {
    //     // Create a component instance to test the isLevelClickable function
    //     const {container} = render(
    //         <GameStateContext.Provider value={{state: mockState, dispatch: mockDispatch}}>
    //             <SidebarNavigationContainer/>
    //         </GameStateContext.Provider>
    //     );
    //
    //     // Get all level elements
    //
    //     // Check if the correct levels are clickable
    //     // Rule 1: All solved levels are clickable (topic1/level1.py)
    //     // Rule 2: First level in each topic is clickable (topic1/level1.py, topic2/level1.py)
    //     // Rule 3: Next level after any solved level is clickable (topic1/level2.py)
    //
    //     // topic1/level1.py - Should be clickable (solved + first level)
    //
    //     // topic1/level2.py - Should be clickable (next after solved)
    //
    //     // topic1/level3.py - Should not be clickable
    // });
});