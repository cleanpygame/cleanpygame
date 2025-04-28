import React from 'react';
import {ChatMessage, ChatMessageType} from '../types';

interface BuddyChatMessageProps {
    message: ChatMessage;
}

/**
 * BuddyChatMessage component
 * Renders a message from the buddy
 */
function BuddyChatMessage({message}: BuddyChatMessageProps): React.ReactElement {
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

    return (
        <div className="flex items-start">
      <span className="flex-shrink-0 mr-2 mt-1">
        😎️
      </span>
            <div className={`rounded-lg p-3 bg-gray-900 ${getTextColor(message.type)}`}>
                <span className="whitespace-pre-wrap">{message.text}</span>
            </div>
        </div>
    );
}

export default BuddyChatMessage;