import React from 'react';

/**
 * BuddyChatMessage component
 * Renders a message from the buddy
 */
function BuddyChatMessage({message}) {
    // Get text color based on a message type
    const getTextColor = (type) => {
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
            <div className={`max-w-[80%] rounded-lg p-3 bg-gray-900 ${getTextColor(message.type)}`}>
                <span className="whitespace-pre-wrap">{message.text}</span>
            </div>
        </div>
    );
}

export default BuddyChatMessage;
