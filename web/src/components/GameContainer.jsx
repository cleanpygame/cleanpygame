import { useContext } from 'react';
import { GameStateContext } from '../reducer.js';
import { TopBar } from './TopBar.jsx';
import { SidebarNavigationContainer } from './SidebarNavigationContainer.jsx';
import { LevelViewportContainer } from './LevelViewportContainer.jsx';
import { NotebookDrawer } from './NotebookDrawer.jsx';

/**
 * Main game container component
 */
export function GameContainer() {
  const { state, dispatch } = useContext(GameStateContext);
  
  const handleOpenNotebook = () => {
    dispatch({
      type: 'OPEN_NOTEBOOK',
      payload: { mode: 'opened' }
    });
  };

  const handleAskForHelp = () => {
    dispatch({ type: 'SHOW_HINT' });
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress?')) {
      dispatch({ type: 'RESET_PROGRESS' });
    }
  };
  
  const handleCloseNotebook = () => {
    dispatch({ type: 'CLOSE_NOTEBOOK' });
  };
  
  const handleNextLevel = () => {
    dispatch({ type: 'NEXT_LEVEL' });
  };
  
  // Get the current wisdoms for the notebook
  const getWisdomEntries = () => {
    const entries = [];
    
    state.topics.forEach(topic => {
      topic.wisdoms.forEach(wisdom => {
        if (state.discoveredWisdoms.includes(wisdom.id)) {
          entries.push(wisdom);
        }
      });
    });
    
    return entries;
  };
  
  // Find new wisdoms (from the current level)
  const getNewWisdomIds = () => {
    if (!state.currentLevel) return [];
    
    return state.currentLevel.level.wisdoms.filter(
      id => state.discoveredWisdoms.includes(id)
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#2d2d2d] text-[#d4d4d4]">
      <TopBar onNotebook={handleOpenNotebook} onReset={handleResetProgress} onHelp={handleAskForHelp} />
      
      <div className="flex flex-1 overflow-hidden">
        <SidebarNavigationContainer />
        <LevelViewportContainer />
      </div>
      
      <NotebookDrawer 
        isOpen={state.notebookState !== 'closed'}
        mode={state.notebookState}
        wisdoms={getWisdomEntries()}
        newIds={getNewWisdomIds()}
        onClose={handleCloseNotebook}
        onNext={handleNextLevel}
      />
    </div>
  );
}
