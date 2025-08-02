import React, {useEffect, useState} from 'react';
import {useLevelContext} from '../context/LevelContext';
import {parseLevelText} from '../levels_compiler/parser';
import {
    generateHintAndExplanation,
    generateRandomPythonCode,
    generateStartAndFinalMessages,
    getSelectedGeminiModel
} from '../utils/aiCoAuthor';

/**
 * AiCoAuthor component
 * Renders the AI Co-Author interface with API key input and generation buttons
 */
export function AiCoAuthor(): React.ReactElement {
    const {code, setCode} = useLevelContext();
    const [apiKey, setApiKey] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>(getSelectedGeminiModel());
    const [codeStyleIssue, setCodeStyleIssue] = useState<string>('');

    // Available models
    const models = [
        'gemini-2.5-flash-lite',
        'gemini-2.5-flash',
        'gemini-2.5-pro'
    ];

    // Load API key and selected model from local storage on component mount
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

    // Save selected model to local storage when it changes
    useEffect(() => {
        localStorage.setItem('selectedGeminiModel', selectedModel);
    }, [selectedModel]);

    // Handle API key input change
    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setApiKey(e.target.value);
    };

    // Handle model selection change
    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedModel(e.target.value);
    };

    // Handle code style issue input change
    const handleCodeStyleIssueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCodeStyleIssue(e.target.value);
    };

    // Handle generating random Python code
    const handleGenerateRandomPythonCode = async () => {
        try {
            if (!apiKey) {
                alert('Please enter a Gemini API key');
                return;
            }
            if (!codeStyleIssue.trim()) {
                alert('Please enter a code style issue');
                return;
            }
            const randomCode = await generateRandomPythonCode(codeStyleIssue, apiKey, selectedModel);
            setCode(randomCode);
        } catch (error) {
            console.error('Error generating random Python code:', error);
            alert('Failed to generate random Python code. Please check the console for details.');
        }
    };

    // Handle generating start and final messages
    const handleGenerateStartAndFinalMessages = async () => {
        try {
            if (!apiKey) {
                alert('Please enter a Gemini API key');
                return;
            }
            const updatedCode = await generateStartAndFinalMessages(code, apiKey, selectedModel);
            setCode(updatedCode);
        } catch (error) {
            console.error('Error generating start and final messages:', error);
            alert('Failed to generate start and final messages. Please check the console for details.');
        }
    };

    // Handle generating hint and explanation for a specific event
    const handleGenerateHintAndExplanation = async (eventId: string) => {
        try {
            if (!apiKey) {
                alert('Please enter a Gemini API key');
                return;
            }
            const updatedCode = await generateHintAndExplanation(code, eventId, apiKey, selectedModel);
            setCode(updatedCode);
        } catch (error) {
            console.error('Error generating hint and explanation:', error);
            alert('Failed to generate hint and explanation. Please check the console for details.');
        }
    };

    // Parse the code to extract events using the parser
    const extractEvents = (codeText: string): string[] => {
        // Parse the code using parseLevelText
        const parseResult = parseLevelText(codeText);

        // If there's an error in parsing, return an empty array
        if (parseResult.error || !parseResult.level) {
            return [];
        }

        // Collect all events from replace and replace-span blocks
        const events = new Set<string>();

        for (const block of parseResult.level.blocks) {
            if ((block.type === 'replace' || block.type === 'replace-span') && block.event) {
                // The event property can be a string or an array of strings
                if (typeof block.event === 'string') {
                    events.add(block.event);
                } else if (Array.isArray(block.event)) {
                    // Add each event in the array
                    for (const event of block.event) {
                        events.add(event);
                    }
                }
            }
        }

        // Convert the Set to an array and return
        return Array.from(events);
    };

    const events = extractEvents(code);

    return (
        <div className={`ai-tab p-2`}>
            <h2 className="text-lg font-semibold mb-4">AI Co-Author</h2>

            {/* API Key Input */}
            <div className="mb-6">
                <label htmlFor="api-key" className="block text-sm font-medium mb-2">
                    Gemini API Key
                </label>
                <input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-gray-700 rounded text-white"
                    placeholder="Enter your Gemini API key"
                />
                <p className="text-xs text-gray-400 mt-1">
                    Your API key is stored only in your browser's local storage. It is not stored on our server and is
                    not even transferred to us.
                    It is used to directly call LLM API from your browser.
                </p>
            </div>

            {/* Model Selection */}
            <div className="mb-6">
                <label htmlFor="model-select" className="block text-sm font-medium mb-2">
                    Select Model
                </label>
                <select
                    id="model-select"
                    value={selectedModel}
                    onChange={handleModelChange}
                    className="w-full px-3 py-2 bg-[#2d2d2d] border border-gray-700 rounded text-white"
                >
                    {models.map((model) => (
                        <option key={model} value={model}>
                            {model}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                    More powerful models — better results, but more expensive.
                </p>
            </div>

            {/* Generate Buttons */}
            <div className="mb-6">
                <h3 className="text-md font-medium mb-3">Generate Content</h3>

                {/* Start and Final Messages Button */}
                <button
                    className="w-full px-4 py-2 mb-3 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded text-left"
                    onClick={handleGenerateStartAndFinalMessages}
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
                            onClick={() => handleGenerateHintAndExplanation(event)}
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

            {/* Code Style Issues Section */}
            <div className="mb-6">
                <h3 className="text-md font-medium mb-3">Code Style Issues</h3>

                {/* Code Style Issue Input */}
                <div className="mb-4">
                    <label htmlFor="code-style-issue" className="block text-sm font-medium mb-2">
                        Enter Code Style Issue
                    </label>
                    <textarea
                        id="code-style-issue"
                        value={codeStyleIssue}
                        onChange={handleCodeStyleIssueChange}
                        className="w-full px-3 py-2 bg-[#2d2d2d] border border-gray-700 rounded text-white min-h-[100px]"
                        placeholder="Describe the code style issue (e.g., poor variable naming, magic numbers, long functions)"
                    />
                </div>

                {/* Random Python Code Button */}
                <button
                    className="w-full px-4 py-2 mb-3 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded text-left"
                    onClick={handleGenerateRandomPythonCode}
                >
                    Generate Random Python Code
                </button>
            </div>
        </div>
    );
}