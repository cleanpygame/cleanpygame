import React, {useContext} from 'react';
import {GameStateContext, GET_HINT, NEXT_LEVEL, POST_BUDDY_MESSAGE} from '../reducer';
import BuddyChatMessage from './BuddyChatMessage';
import MyChatMessage from './MyChatMessage';

/**
 * BuddyChat component
 * Renders chat messages and provides a help button
 */
export function BuddyChat() {
  const { state, dispatch } = useContext(GameStateContext);

  const handleGetHint = () => {
    dispatch({ type: POST_BUDDY_MESSAGE, payload: { message: { type: "me", text: 'I need help!' } } });
    setTimeout(() => dispatch({ type: GET_HINT }), 300);
  };

  const handleGotIt = () =>
      dispatch({ type: POST_BUDDY_MESSAGE, payload: { message: { type: "me", text: 'Got it!' } } });

  const handleNextLevel = () =>
      dispatch({ type: NEXT_LEVEL });


  // Render different button based on a message type
  const renderButton = () => {
    if (state.currentLevel.isFinished) {
      return (
          <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md mt-2 cursor-pointer"
              onClick={handleNextLevel}
          >
            Next task, please!
          </button>
      );
    }
    if (state.currentLevel.chatMessages && state.currentLevel.chatMessages[state.currentLevel.chatMessages.length - 1].type === 'buddy-instruct')
      return (
          <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md mt-2 cursor-pointer"
              onClick={handleGotIt}
          >
            Got it!
          </button>
      );
    return (
        <button
            className="px-4 py-2 bg-gray-600 text-white rounded-md mt-2 cursor-pointer"
            onClick={handleGetHint}
        >
          I need help!
        </button>
    );
  };

  return (
    <div 
      className="w-1/3 absolute bottom-0 right-0 flex flex-col bg-gray-800 border-l border-t border-gray-700 overflow-hidden"
    >
      <div className="p-2 border-b border-gray-700">
        <h2 className="text-lg font-medium text-white">Buddy Chat</h2>
      </div>

      <div className="h-64 overflow-y-auto p-3 flex flex-col-reverse space-y-reverse space-y-2">
        {state.chatMessages.slice().reverse().map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.type === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'me'
                ? <MyChatMessage message={message}/>
                : <BuddyChatMessage message={message}/>
            }
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700">
        {renderButton()}
      </div>
    </div>
  );
}
