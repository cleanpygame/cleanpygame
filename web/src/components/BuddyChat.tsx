import React, {useContext, useMemo} from 'react';
import {GameStateContext, GET_HINT, NEXT_LEVEL, POST_BUDDY_MESSAGE} from '../reducer';
import BuddyChatMessage from './BuddyChatMessage';
import MyChatMessage from './MyChatMessage';
import {ChatMessage} from '../types';

/**
 * BuddyChat component
 * Renders chat messages and provides a help button
 */
export function BuddyChat(): React.ReactElement {
    const context = useContext(GameStateContext);

    if (!context) {
        throw new Error('BuddyChat must be used within a GameStateContext Provider');
    }

    const {state, dispatch} = context;

    const handleGetHint = (): void => {
        dispatch({
            type: POST_BUDDY_MESSAGE,
            payload: {message: {type: "me", text: 'I need help!'} as ChatMessage}
        });
        setTimeout(() => dispatch({type: GET_HINT}), 300);
    };

    const handleGotIt = (): void =>
        dispatch({
            type: POST_BUDDY_MESSAGE,
            payload: {message: {type: "me", text: 'Got it!'} as ChatMessage}
        });

    const handleNextLevel = (): void =>
        dispatch({type: NEXT_LEVEL});

    // Render different button based on a message type
    const renderButton = (): React.ReactNode => {
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

        const lastMessage = state.chatMessages[state.chatMessages.length - 1];
        if (lastMessage && lastMessage.type === 'buddy-instruct') {
            return (
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md mt-2 cursor-pointer"
                    onClick={handleGotIt}
                >
                    Got it!
                </button>
            );
        }

        return (
            <button
                className="px-4 py-2 bg-gray-600 text-white rounded-md mt-2 cursor-pointer"
                onClick={handleGetHint}
            >
                I need help!
            </button>
        );
    };

    // Determine if elements should flash
    const shouldFlash = useMemo(() => {
        // Case 1: Level is finished
        if (state.currentLevel.isFinished) {
            return true;
        }

        // Get the last message
        const lastMessage = state.chatMessages[state.chatMessages.length - 1];
        if (!lastMessage) return false;

        // Case 2: New level instructions are shown
        if (lastMessage.type === 'buddy-instruct') {
            return true;
        }

        // Case 3: Auto hint appeared
        if (lastMessage.type === 'buddy-help') {
            return true;
        }

        return false;
    }, [state.currentLevel.isFinished, state.chatMessages]);

    return (
        <div
            className={`w-1/3 absolute bottom-0 right-0 flex flex-col bg-gray-800 border-l border-t border-gray-700 ${shouldFlash ? 'flash-border' : ''} overflow-hidden`}
        >
            <div className={`p-2 border-b border-gray-700 ${shouldFlash ? 'flash-header' : ''}`}>
                <h2 className="text-lg font-medium text-white">Buddy Chat</h2>
            </div>

            <div className="h-80 overflow-y-auto p-3 flex flex-col-reverse space-y-reverse space-y-2">
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
