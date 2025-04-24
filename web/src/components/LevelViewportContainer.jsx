import { useContext } from 'react';
import { GameStateContext } from '../reducer';
import { CodeView } from './CodeView.jsx';
import { BuddyChat } from './BuddyChat.jsx';
import { applyEvents } from "../utils/pylang.js";

/**
 * Level viewport container component
 */
export function LevelViewportContainer() {
  const { state, dispatch } = useContext(GameStateContext);

  // Compute regions and lines for CodeView

  const { code, regions } = applyEvents(state.currentLevel.level.blocks, state.currentLevel.triggeredEvents);

  const handleEventClick = (eventId, lineIndex, colIndex, token) => {
    setTimeout(() => {
      dispatch({
        type: 'APPLY_FIX',
        payload: { eventId, lineIndex, colIndex, token }
      });
    }, 200);
  };

  const handleMisclick = (lineIndex, colIndex, token) => {
    dispatch({
      type: 'WRONG_CLICK',
      payload: { lineIndex, colIndex, token }
    });
  };

  if (!state.currentLevel) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <p className="text-lg text-[#888888]">Select a level to begin</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto relative bg-[#1e1e1e]">
      <div className="p-2 border-b border-[#3c3c3c]">
        <h1 className="text-lg font-medium">{state.currentLevel.level.filename}</h1>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="code-viewport flex-1 overflow-hidden relative">
          <CodeView
            code={code}
            regions={regions}
            animate={true}
            contentId={state.currentLevel.level.topic + "/" + state.currentLevel.level.filename}
            onEvent={handleEventClick}
            onMisclick={handleMisclick}
          />
        </div>
        <BuddyChat />
      </div>
    </div>
  );
}
