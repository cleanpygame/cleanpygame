import { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GameStateContext } from '../reducer.js';

/**
 * Notebook container component
 */
export function NotebookContainer() {
  const { state, dispatch } = useContext(GameStateContext);
  const [portalElement, setPortalElement] = useState(null);

  // Create portal element
  useEffect(() => {
    const element = document.createElement('div');
    document.body.appendChild(element);
    setPortalElement(element);

    return () => {
      document.body.removeChild(element);
    };
  }, []);

  const handleCloseNotebook = () => {
    dispatch({ type: 'CLOSE_NOTEBOOK' });
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

  // Group wisdoms by topic
  const wisdoms = getWisdomEntries();
  const newIds = getNewWisdomIds();
  // Handle both notebookOpen and notebookState for backward compatibility
  const isOpen = state.notebookOpen;

  // Check if wisdom is new
  const isNewWisdom = (id) => newIds.includes(id);

  if (!portalElement || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-[#252526] w-full max-w-md h-full overflow-y-auto shadow-lg transform transition-transform duration-300">
        <div className="sticky top-0 bg-[#252526] p-4 border-b border-[#3c3c3c] flex justify-between items-center">
          <h2 className="text-xl font-medium">
            Wisdom Notebook
          </h2>
          <button
            className="text-[#888888] hover:text-white transition-colors"
            onClick={handleCloseNotebook}
            aria-label="Close notebook"
          >
            ✕
          </button>
        </div>

        <div className="p-4">

          {wisdoms.length > 0 ? (
              <ul className="space-y-3">
                {wisdoms.map((wisdom) => (
                    <li
                      key={wisdom.id}
                      className={`p-3 rounded ${isNewWisdom(wisdom.id) ? 'bg-[#3c3c3c]' : 'bg-[#2d2d2d]'}`}
                    >
                      {isNewWisdom(wisdom.id) && (
                        <span className="inline-block px-2 py-1 text-xs bg-blue-600 text-white rounded mb-2">
                          New
                        </span>
                      )}
                      <p>{wisdom.text}</p>
                    </li>
                ))}
              </ul>
          ) : (
            <p className="text-[#888888]">
              You haven't unlocked any wisdoms yet. Complete levels to collect wisdom!
            </p>
          )}
        </div>
      </div>
    </div>,
    portalElement
  );
}
