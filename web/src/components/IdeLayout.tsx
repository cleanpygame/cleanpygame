import React from 'react';
import {TopBar} from './TopBar';
import {SidebarNavigationContainer} from './SidebarNavigationContainer';
import {LevelViewportContainer} from './LevelViewportContainer';
import {NotebookContainer} from './NotebookContainer';

export function IdeLayout(): React.ReactElement {
    return (
        <div className="flex flex-col h-screen bg-[#2d2d2d] text-[#d4d4d4]">
            <TopBar/>

            <div className="flex flex-1 overflow-hidden">
                <SidebarNavigationContainer/>
                <LevelViewportContainer/>
            </div>

            <NotebookContainer/>
        </div>
    );
}