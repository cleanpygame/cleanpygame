import React, {useContext, useEffect, useState} from 'react';
import {ChatMessage, ChatMessageType} from '../types';
import {GameStateContext, SET_TYPING_ANIMATION_COMPLETE} from '../reducer';

interface BuddyChatMessageProps {
    message: ChatMessage;
    isNew?: boolean;
}

/**
 * BuddyChatMessage component
 * Renders a message from the buddy with typing animation
 */
function BuddyChatMessage({message, isNew = false}: BuddyChatMessageProps): React.ReactElement {
    const [displayedText, setDisplayedText] = useState('');
    const [isTypingComplete, setIsTypingComplete] = useState(false);

    const context = useContext(GameStateContext);

    if (!context) {
        throw new Error('BuddyChatMessage must be used within a GameStateContext Provider');
    }

    const {dispatch} = context;

    // Get text color based on a message type
    const getTextColor = (type: ChatMessageType): string => {
        switch (type) {
            case 'buddy-explain':
                return 'text-green-400';
            case 'buddy-reject':
                return 'text-red-400';
            default:
                return 'text-white';
        }
    };

    // Typing animation effect
    useEffect(() => {
        // Reset state when a message changes
        setDisplayedText('');
        setIsTypingComplete(false);

        const messageText = message.text || '';

        // Skip animation for existing messages or very long messages (performance optimization)
        if (!isNew || messageText.length > 500) {
            setDisplayedText(messageText);
            setIsTypingComplete(true);
            return;
        }

        let currentIndex = 0;
        // Function to add one character at a time
        const typingInterval = setInterval(() => {
            if (currentIndex < messageText.length) {
                // Use substring instead of concatenating individual characters
                // This ensures we don't miss any characters due to async state updates
                const newText = messageText.substring(0, Math.min(messageText.length, currentIndex + 1));
                setDisplayedText(newText);
                currentIndex += 2;
            } else {
                clearInterval(typingInterval);
                setIsTypingComplete(true);
            }
        }, 15); // Adjust typing speed here

        return () => clearInterval(typingInterval);
    }, [message.text, isNew]);

    // Update global state when typing animation completes
    useEffect(() => {
        if (isNew) {
            dispatch({
                type: SET_TYPING_ANIMATION_COMPLETE,
                payload: {isComplete: isTypingComplete}
            });
        }
    }, [isTypingComplete, isNew, dispatch]);

    return (
        <div className="flex items-start">
            <span className="flex-shrink-0 mr-2 mt-1">
                😎️
            </span>
            <div className={`rounded-lg p-3 bg-gray-900 ${getTextColor(message.type)}`}>
                <span className="whitespace-pre-wrap">
                    {displayedText}
                    {!isTypingComplete && <span className="animate-pulse">▌</span>}
                </span>
            </div>
        </div>
    );
}

export default BuddyChatMessage;
