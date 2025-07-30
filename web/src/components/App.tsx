import React, {lazy, ReactElement, Suspense} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {StateProvider} from './StateProvider';
import {IdeLayout} from './IdeLayout';
import {GroupPage} from './GroupPage';
import {GroupsPage} from './GroupsPage';
import {PlayerStatsPage} from './PlayerStatsPage';
import {GroupJoinPage} from './GroupJoinPage.tsx';
import {GroupJoinFinalPage} from './GroupJoinFinalPage.tsx';
import {CommunityLevelLoader} from './CommunityLevelLoader';
import {TopBar} from './TopBar';
import {AdminRoute} from './AdminRoute';
import {AdminActivityPage} from './AdminActivityPage';

// Lazy load EditorPage component
const EditorPage = lazy(() =>
    import('./EditorPage').then(module => ({default: module.EditorPage}))
);

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
                    <Route path="/editor" element={
                        <Suspense fallback={<div
                            className="flex items-center justify-center h-screen bg-[#2d2d2d] text-[#d4d4d4]">Loading
                            editor...</div>}>
                            <EditorPage/>
                        </Suspense>
                    }/>
                    <Route path="/editor/:levelId" element={
                        <Suspense fallback={<div
                            className="flex items-center justify-center h-screen bg-[#2d2d2d] text-[#d4d4d4]">Loading
                            editor...</div>}>
                            <EditorPage/>
                        </Suspense>
                    }/>
                    <Route path="/community-levels/:levelId" element={<>
                        <CommunityLevelLoader/>
                        <IdeLayout/>
                    </>}/>
                    <Route path="/admin/activity" element={
                        <AdminRoute>
                            <TopBarPageWrapper Component={AdminActivityPage}/>
                        </AdminRoute>
                    }/>
                    <Route path="*" element={<IdeLayout/>}/>
                </Routes>
            </StateProvider>
        </BrowserRouter>
    );
}