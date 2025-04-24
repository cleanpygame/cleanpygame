/**
 * Hint overlay component
 * @param {Object} props - Component props
 * @param {string} props.message - Hint message
 * @param {Function} props.onClose - Close hint callback
 */
export function HintOverlay({ message, onClose }) {
  return (
    <div className="absolute bottom-4 right-4 bg-[#2d2d2d] p-4 rounded-lg shadow-lg max-w-m z-20 w-100">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">🧔‍♂️ Buddy</h3>
        <button
          className="text-[#888888] hover:text-white transition-colors"
          onClick={onClose}
          aria-label="Close hint"
        >
          ✕
        </button>
      </div>
      
      <p className="text-[#d4d4d4]">{message}</p>
    </div>
  );
}
