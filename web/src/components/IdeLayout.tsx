import React, {useContext} from 'react';
import {TopBar} from './TopBar';
import {SidebarNavigationContainer} from './SidebarNavigationContainer';
import {LevelViewportContainer} from './LevelViewportContainer';
import {NotebookContainer} from './NotebookContainer';
import {PlayerStatsPage} from './PlayerStatsPage';
import {GameStateContext} from '../reducers';

export function IdeLayout(): React.ReactElement {
    const context = useContext(GameStateContext);

    if (!context) {
        throw new Error('IdeLayout must be used within a GameStateContext Provider');
    }

    const {state} = context;
    const {statsPageVisible} = state;
    
    return (
        <div className="flex flex-col h-screen bg-[#2d2d2d] text-[#d4d4d4]">
            <TopBar/>

            {statsPageVisible ? (
                <div className="flex-1 overflow-hidden">
                    <PlayerStatsPage/>
                </div>
            ) : (
                <>
                    <div className="flex flex-1 overflow-hidden">
                        <SidebarNavigationContainer/>
                        <LevelViewportContainer/>
                    </div>
                    <NotebookContainer/>
                </>
            )}
        </div>
    );
}