import { TopBar } from './TopBar.jsx';
import { SidebarNavigationContainer } from './SidebarNavigationContainer.jsx';
import { LevelViewportContainer } from './LevelViewportContainer.jsx';
import { NotebookContainer } from './NotebookContainer.jsx';

/**
 * Main game container component
 */
export function IdeLayout() {

  return (
    <div className="flex flex-col h-screen bg-[#2d2d2d] text-[#d4d4d4]">
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <SidebarNavigationContainer />
        <LevelViewportContainer />
      </div>

      <NotebookContainer />
    </div>
  );
}
