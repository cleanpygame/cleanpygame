import React, {useEffect, useState} from 'react';
import {useLevelContext} from '../context/LevelContext';

/**
 * AiCoAuthor component
 * Renders the AI Co-Author interface with API key input and generation buttons
 */
export function AiCoAuthor(): React.ReactElement {
    const {code} = useLevelContext();
    const [apiKey, setApiKey] = useState<string>('');

    // Load API key from local storage on component mount
    useEffect(() => {
        const savedApiKey = localStorage.getItem('geminiApiKey');
        if (savedApiKey) {
            setApiKey(savedApiKey);
        }
    }, []);

    // Save API key to local storage when it changes
    useEffect(() => {
        if (apiKey) {
            localStorage.setItem('geminiApiKey', apiKey);
        }
    }, [apiKey]);

    // Handle API key input change
    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setApiKey(e.target.value);
    };

    // Parse the code to extract events (placeholder for now)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const extractEvents = (_codeText: string): string[] => {
        // This is a placeholder implementation
        // In a real implementation, we would parse the code to extract events
        return ['event1', 'event2'];
    };

    const events = extractEvents(code);

    return (
        <div className={`ai-tab p-2`}>
            <h2 className="text-lg font-semibold mb-4">AI Co-Author</h2>

            {/* API Key Input */}
            <div className="mb-6">
                <label htmlFor="api-key" className="block text-sm font-medium mb-2">
                    Gemini Flash API Key
                </label>
                <input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-gray-700 rounded text-white"
                    placeholder="Enter your Gemini Flash API key"
                />
                <p className="text-xs text-gray-400 mt-1">
                    Your API key is stored in your browser's local storage.
                </p>
            </div>

            {/* Generate Buttons */}
            <div className="mb-6">
                <h3 className="text-md font-medium mb-3">Generate Content</h3>

                {/* Start and Final Messages Button */}
                <button
                    className="w-full px-4 py-2 mb-3 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded text-left"
                >
                    Generate Start and Final Messages
                </button>

                {/* Event Buttons */}
                <h4 className="text-sm font-medium mb-2 mt-4">Generate Hints and Explanations</h4>
                {events.length > 0 ? (
                    events.map((event, index) => (
                        <button
                            key={index}
                            className="w-full px-4 py-2 mb-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded text-left"
                        >
                            Generate for event: {event}
                        </button>
                    ))
                ) : (
                    <p className="text-sm text-gray-400">
                        No events found in the current code.
                    </p>
                )}
            </div>
        </div>
    );
}