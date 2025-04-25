import {useContext, useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {GameStateContext} from '../reducer.js';

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

  // Group wisdoms by topic
  const wisdoms = getWisdomEntries();
  // Handle both notebookOpen and notebookState for backward compatibility
  const isOpen = state.notebookOpen;

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
                      className={`p-3 rounded bg-[#2d2d2d]`}
                    >
                      <p>{wisdom.text}</p>
                    </li>
                ))}
              </ul>
          ) : (
            <p className="text-[#888888]">
              Nothing here yet...
            </p>
          )}
        </div>
      </div>
    </div>,
    portalElement
  );
}
