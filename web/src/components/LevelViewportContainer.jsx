import { useContext } from 'react';
import { GameStateContext } from '../reducer';
import { CodeView } from './CodeView.jsx';
import { FixPreviewOverlay } from './FixPreviewOverlay.jsx';
import { LockUiOverlay } from './LockUiOverlay.jsx';
import { HintOverlay } from './HintOverlay.jsx';
import { applyEvents } from "../utils/pylang.js";

/**
 * Level viewport container component
 */
export function LevelViewportContainer() {
  const { state, dispatch } = useContext(GameStateContext);

  // Compute regions and lines for CodeView

  const { code, regions } = applyEvents(state.currentLevel.level.blocks, state.currentLevel.triggeredEvents);

  // Find current event info for fix preview
  const getCurrentEventInfo = () => {
    if (!state.currentLevel || !state.currentLevel.justTriggeredEvent) {
      return null;
    }

    const eventId = state.currentLevel.justTriggeredEvent;
    const before = applyEvents(state.currentLevel.level.blocks, state.currentLevel.triggeredEvents).code;
    const after = applyEvents(state.currentLevel.level.blocks, [...state.currentLevel.triggeredEvents, state.currentLevel.justTriggeredEvent]).code;


    return {
      explanation: 'TODO',
      before: before,
      after: after,
      eventId
    };
  };

  // Find current hint
  const getCurrentHint = () => {
    if (
      !state.currentLevel ||
      !state.currentLevel.isHintShown ||
      !state.currentLevel.currentHintId
    ) {
      return null;
    }

    const block = state.currentLevel.level.blocks.find(
      b => b.event === state.currentLevel.currentHintId && b.hint
    );

    return block?.hint || 'Sorry, no hints before lunch...';
  };

  const handleEventClick = (eventId) => {
    setTimeout(() => {
      dispatch({
        type: 'CONFIRM_FIX',
        payload: { eventId }
      });
    }, 200);
  };

  const handleMisclick = () => {
    dispatch({ type: 'LOCK_AFTER_MISTAKE' });
  };

  const handleApplyFix = (eventId) => {
    dispatch({
      type: 'CONFIRM_FIX',
      payload: { eventId }
    });
  };

  const handleHideHint = () => {
    dispatch({ type: 'HIDE_HINT' });
  };

  if (!state.currentLevel) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <p className="text-lg text-[#888888]">Select a level to begin</p>
      </div>
    );
  }

  const currentEventInfo = getCurrentEventInfo();
  const currentHint = getCurrentHint();
  const isLocked = state.currentLevel.lockUiUntil > Date.now();

  return (
    <div className="flex-1 flex flex-col overflow-auto relative bg-[#1e1e1e]">
      <div className="p-2 border-b border-[#3c3c3c]">
        <h1 className="text-lg font-medium">{state.currentLevel.level.filename}</h1>
      </div>

      <div className="code-viewport flex-1 overflow-hidden relative">
        {isLocked && (
            <LockUiOverlay
                message="No, this is not a problem."
                lockoutMs={(state.currentLevel.lockUiUntil - Date.now())}
            />
        )}
        <CodeView
          code={code}
          regions={regions}
          animate={true}
          contentId={state.currentLevel.level.topic + "/" + state.currentLevel.level.filename}
          onEvent={handleEventClick}
          onMisclick={handleMisclick}
        />

        {currentEventInfo && (
          <FixPreviewOverlay
            explanation={currentEventInfo.explanation}
            before={currentEventInfo.before}
            after={currentEventInfo.after}
            onApply={() => handleApplyFix(currentEventInfo.eventId)}
          />
        )}

        {currentHint && (
          <HintOverlay
            message={currentHint}
            onClose={handleHideHint}
          />
        )}

        {/* Level completion logic */}
        {state.currentLevel.triggeredEvents.length > 0 &&
         state.currentLevel.level.blocks.every(block =>
           block.type !== 'replace' && block.type !== 'replace-span' ||
           !block.event ||
           state.currentLevel.triggeredEvents.includes(block.event)
         ) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-[#2d2d2d] p-6 rounded shadow-lg max-w-md">
              <h2 className="text-xl mb-3">Level Completed!</h2>
              <p className="mb-4">
                You've successfully fixed all the code issues in this level.
              </p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={() => {
                  dispatch({
                    type: 'OPEN_NOTEBOOK',
                    payload: { mode: 'level_finished' }
                  });
                }}
              >
                View Unlocked Wisdoms
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
