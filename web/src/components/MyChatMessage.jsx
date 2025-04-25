import React from 'react';

/**
 * MyChatMessage component
 * Renders a message from the user
 */
function MyChatMessage({message}) {
    return (
        <div className="max-w-[80%] rounded-lg p-3 bg-gray-600 text-white">
            <span className="whitespace-pre-wrap">{message.text}</span>
        </div>
    );
}

export default MyChatMessage;