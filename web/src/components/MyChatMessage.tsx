import React from 'react';
import {ChatMessage} from '../types';

interface MyChatMessageProps {
    message: ChatMessage;
}

/**
 * MyChatMessage component
 * Renders a message from the user
 */
function MyChatMessage({message}: MyChatMessageProps): React.ReactElement {
    return (
        <div className="rounded-lg p-3 bg-gray-600 text-white">
            <span className="whitespace-pre-wrap">{message.text}</span>
        </div>
    );
}

export default MyChatMessage;