import { useContext } from 'react';
import { GameStateContext } from '../reducer.js';

/**
 * Top navigation bar component
 * Dispatches actions: OPEN_NOTEBOOK, RESET_PROGRESS, GET_HINT
 */
export function TopBar() {
  const { dispatch } = useContext(GameStateContext);

  const handleOpenNotebook = () => {
    dispatch({ type: 'OPEN_NOTEBOOK' });
  };

  const handleAskForHelp = () => {
    dispatch({ type: 'GET_HINT' });
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress?')) {
      dispatch({ type: 'RESET_PROGRESS' });
    }
  };

  return (
    <div className="flex items-center justify-between h-12 px-4 bg-[#252526] border-b border-[#3c3c3c]">
      <div className="text-lg font-medium">Clean Code Game</div>

      <div className="flex gap-4">
        <button
            onClick={handleAskForHelp}
            className="px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors"
            title="Ask for Help"
        >
          <span role="img" aria-label="help">🙏</span>
          <span>Ask for Help</span>
        </button>

        <button
          onClick={handleOpenNotebook}
          className="px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors"
          title="Open Notebook"
        >
          <span role="img" aria-label="notebook">📒</span>
          <span>Notebook</span>
        </button>

        <button
          onClick={handleResetProgress}
          className="px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors"
          title="Reset Progress"
        >
          <span role="img" aria-label="reset">🔄</span>
          <span>Reset Progress</span>
        </button>
      </div>
    </div>
  );
}
