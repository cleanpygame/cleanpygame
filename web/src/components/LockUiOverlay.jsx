import { useEffect, useState } from 'react';

/**
 * Incorrect click overlay component
 * @param {Object} props - Component props
 * @param {string} props.message - Message to display
 * @param {number} props.lockoutMs - Lockout time in milliseconds
 */
export function LockUiOverlay({ message, lockoutMs }) {
  const [timeLeft, setTimeLeft] = useState(lockoutMs);
  
  // Update countdown timer
  useEffect(() => {
    setTimeLeft(lockoutMs);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 100;
        return newTime < 0 ? 0 : newTime;
      });
    }, 100);
    
    return () => clearInterval(timer);
  }, [lockoutMs]);
  
  // Calculate progress percentage
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / lockoutMs) * 100));

  return (
    <div className="absolute z-10 left-4 bottom-4 justify-center bg-[#2d2d2d] p-4 rounded-lg shadow-lg max-w-sm">
      <p className="mb-2">{message}</p>
      
      <div className="bg-[#1e1e1e] h-2 rounded overflow-hidden">
        <div 
          className="bg-red-500 h-full transition-all duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <p className="mt-2 text-xs text-[#888888]">
        Wait {Math.ceil(timeLeft / 1000)}s before trying again
      </p>
    </div>
  );
}
