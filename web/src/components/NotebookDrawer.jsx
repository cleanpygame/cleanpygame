import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

/**
 * Notebook drawer component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether drawer is open
 * @param {'opened'|'level_finished'} props.mode - Drawer mode
 * @param {WisdomEntry[]} props.wisdoms - List of wisdom entries
 * @param {string[]} props.newIds - IDs of newly unlocked wisdoms
 * @param {Function} props.onClose - Close drawer callback
 * @param {Function} props.onNext - Continue to next level callback
 */
export function NotebookDrawer({ isOpen, mode, wisdoms, newIds, onClose, onNext }) {
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
  
  // Group wisdoms by topic
  const groupedWisdoms = {};
  wisdoms.forEach(wisdom => {
    // Extract topic from wisdom ID (format: topic-wisdomName)
    const topic = wisdom.id.split('-')[0] || 'General';
    
    if (!groupedWisdoms[topic]) {
      groupedWisdoms[topic] = [];
    }
    
    groupedWisdoms[topic].push(wisdom);
  });
  
  // Check if wisdom is new
  const isNewWisdom = (id) => newIds.includes(id);
  
  if (!portalElement || !isOpen) return null;
  
  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="bg-[#252526] w-full max-w-md h-full overflow-y-auto shadow-lg transform transition-transform duration-300">
        <div className="sticky top-0 bg-[#252526] p-4 border-b border-[#3c3c3c] flex justify-between items-center">
          <h2 className="text-xl font-medium">
            {mode === 'level_finished' ? 'Level Completed!' : 'Wisdom Notebook'}
          </h2>
          <button
            className="text-[#888888] hover:text-white transition-colors"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4">
          {mode === 'level_finished' && (
            <div className="mb-6">
              <p className="mb-4">
                Congratulations! You've completed this level and unlocked new wisdoms.
              </p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={onNext}
              >
                Continue to Next Level
              </button>
            </div>
          )}
          
          {Object.entries(groupedWisdoms).length > 0 ? (
            Object.entries(groupedWisdoms).map(([topic, topicWisdoms]) => (
              <div key={topic} className="mb-6">
                <h3 className="text-lg font-medium mb-2 capitalize">{topic}</h3>
                <ul className="space-y-3">
                  {topicWisdoms.map((wisdom) => (
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
              </div>
            ))
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
