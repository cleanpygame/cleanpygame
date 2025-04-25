import {useContext} from 'react';
import {GameStateContext} from '../reducer';
import {CodeView} from './CodeView.jsx';
import {BuddyChat} from './BuddyChat.jsx';

/**
 * Level viewport container component
 */
export function LevelViewportContainer() {
  const { state, dispatch } = useContext(GameStateContext);

  // Get code and regions from state

  const handleCodeClick = (lineIndex, colIndex, token) => {
    dispatch({
      type: 'CODE_CLICK',
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

  const headerStyle = state.currentLevel.isFinished ? 'bg-green-900' : '';

  return (
    <div className="flex-1 flex flex-col overflow-auto relative bg-[#1e1e1e]">
      <div className={`p-2 border-b border-[#3c3c3c] ${headerStyle}`}>
        <h1 className="text-lg font-medium">{state.currentLevel.level.filename}</h1>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="code-viewport flex-1 overflow-hidden relative">
          <CodeView
              code={state.currentLevel.code}
            animate={true}
            contentId={state.currentLevel.level.topic + "/" + state.currentLevel.level.filename}
              onClick={handleCodeClick}
          />
        </div>
        <BuddyChat />
      </div>
    </div>
  );
}
