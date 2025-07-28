import React, {ReactElement} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {StateProvider} from './StateProvider';
import {IdeLayout} from './IdeLayout';
import {GroupPage} from './GroupPage';
import {GroupsPage} from './GroupsPage';
import {PlayerStatsPage} from './PlayerStatsPage';
import {GroupJoinPage} from './GroupJoinPage.tsx';
import {GroupJoinFinalPage} from './GroupJoinFinalPage.tsx';
import {TopBar} from './TopBar';

/**
 * Generic page wrapper component
 * This component is used to render any page component with the correct layout
 */
interface PageWrapperProps {
    Component: React.ComponentType<any>;
}

export function TopBarPageWrapper({Component}: PageWrapperProps): ReactElement {
    return (
        <div className="flex flex-col h-screen bg-[#2d2d2d] text-[#d4d4d4]">
            <TopBar/>
            <div className="flex-1 overflow-auto">
                <Component/>
            </div>
        </div>
    );
}

/**
 * Root application component
 */
export function App(): React.ReactElement {
    return (
        <BrowserRouter>
            <StateProvider>
                <Routes>
                    <Route path="/stats" element={<TopBarPageWrapper Component={PlayerStatsPage}/>}/>
                    <Route path="/stats/:uid" element={<TopBarPageWrapper Component={PlayerStatsPage}/>}/>
                    <Route path="/groups" element={<TopBarPageWrapper Component={GroupsPage}/>}/>
                    <Route path="/groups/:groupId" element={<TopBarPageWrapper Component={GroupPage}/>}/>
                    <Route path="/join/:code" element={<GroupJoinPage/>}/>
                    <Route path="/join/:code/success" element={<GroupJoinFinalPage/>}/>
                    <Route path="*" element={<IdeLayout/>}/>
                </Routes>
            </StateProvider>
        </BrowserRouter>
    );
}