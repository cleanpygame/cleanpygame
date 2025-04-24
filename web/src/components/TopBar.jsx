/**
 * Top navigation bar component
 * @param {Object} props - Component props
 * @param {Function} props.onNotebook - Callback for notebook button
 * @param {Function} props.onReset - Callback for reset progress button
 */
export function TopBar({ onNotebook, onReset, onHelp }) {
  return (
    <div className="flex items-center justify-between h-12 px-4 bg-[#252526] border-b border-[#3c3c3c]">
      <div className="text-lg font-medium">Clean Code Game</div>
      
      <div className="flex gap-4">
        <button
            onClick={onHelp}
            className="px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors"
            title="Ask for Help"
        >
          <span role="img" aria-label="help">🙏</span>
          <span>Ask for Help</span>
        </button>

        <button
          onClick={onNotebook}
          className="px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors"
          title="Open Notebook"
        >
          <span role="img" aria-label="notebook">📒</span>
          <span>Notebook</span>
        </button>
        
        <button
          onClick={onReset}
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
