import Prism from 'prismjs';
import { useEffect, useRef } from 'react';

/**
 * Fix preview overlay component
 * @param {Object} props - Component props
 * @param {string} props.explanation - Explanation text
 * @param {string} props.before - Original code
 * @param {string} props.after - Fixed code
 * @param {Function} props.onApply - Apply fix callback
 */
export function FixPreviewOverlay({ explanation, before, after, onApply }) {
  const beforeRef = useRef(null);
  const afterRef = useRef(null);
  
  // Apply syntax highlighting
  useEffect(() => {
    if (beforeRef.current && afterRef.current) {
      Prism.highlightElement(beforeRef.current);
      Prism.highlightElement(afterRef.current);
    }
  }, [before, after]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
      <div className="bg-[#2d2d2d] rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#3c3c3c]">
          <h2 className="text-xl font-medium">Fix Code Smell</h2>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          <div className="mb-4">
            <h3 className="font-medium mb-2">Explanation</h3>
            <p className="text-[#d4d4d4]">{explanation}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Before</h3>
              <pre className="p-3 bg-[#1e1e1e] rounded overflow-auto text-sm">
                <code ref={beforeRef} className="language-python">
                  {before}
                </code>
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">After</h3>
              <pre className="p-3 bg-[#1e1e1e] rounded overflow-auto text-sm">
                <code ref={afterRef} className="language-python">
                  {after}
                </code>
              </pre>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-[#3c3c3c] flex justify-end">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={onApply}
          >
            Apply Fix
          </button>
        </div>
      </div>
    </div>
  );
}
