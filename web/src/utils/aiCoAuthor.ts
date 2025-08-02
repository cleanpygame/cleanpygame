import {parseLevelText} from '../levels_compiler/parser';
import type {LevelData} from '../types';
import {applyEvents, renderToPyLevel} from './pylang';

/**
 * Utility functions for AI Co-Author feature
 */

/**
 * Generates start and final messages for a level
 * @param code The level code to process
 * @param apiKey The API key for authentication
 * @param model The Gemini model to use
 * @returns The updated level code with generated messages
 */
export async function generateStartAndFinalMessages(code: string, apiKey: string, model: string): Promise<string> {
    // Parse the level code
    const parseResult = parseLevelText(code);

    // If there's an error in parsing, return the original code
    if (parseResult.error || !parseResult.level) {
        return code;
    }

    const level = parseResult.level;
    const newLevel = await updateStartAndFinalMessages(level, apiKey, model);
    return renderToPyLevel(newLevel);
}

/**
 * Generates hint and explanation for a specific event
 * @param code The level code to process
 * @param eventId The event ID to generate hint and explanation for
 * @param apiKey The API key for authentication
 * @param model The Gemini model to use
 * @returns The updated level code with generated hint and explanation
 */
export async function generateHintAndExplanation(code: string, eventId: string, apiKey: string, model: string): Promise<string> {
    // Parse the level code
    const parseResult = parseLevelText(code);

    // If there's an error in parsing, return the original code
    if (parseResult.error || !parseResult.level) {
        return code;
    }

    // Get the level data
    const level = parseResult.level;

    // Update the level with hint and explanation for the event
    const newLevel = await updateHintAndExplanation(level, eventId, apiKey, model);
    return renderToPyLevel(newLevel);
}

/**
 * Updates the level with generated start and final messages using the Gemini API
 * @param level The level data to update
 * @param apiKey The API key for authentication
 * @param model The Gemini model to use
 * @returns The updated level data with generated messages
 */
async function updateStartAndFinalMessages(level: LevelData, apiKey: string, model: string): Promise<LevelData> {
    // Get the initial state of the level (no events triggered)
    const initialState = applyEvents(level.blocks, []);
    const initialCode = initialState.code;

    // Collect all event IDs from the level
    const allEvents = getAllEventIds(level);

    // Get the final state of the level (all events triggered)
    const finalState = applyEvents(level.blocks, allEvents);
    const finalCode = finalState.code;

    // Construct the prompt for the Gemini API
    const prompt = constructStartAndFinalPrompt(initialCode, finalCode);
    console.log(prompt)

    // Call the Gemini API
    const response = await callGeminiApi(prompt, apiKey, model);
    console.log(response)

    // Parse the response and update the level
    return parseStartAndFinalResponse(level, response);
}

function getCodeBeforeAndAfter(level: LevelData, eventId: string) {
    const allEvents = getAllEventIds(level).filter(e => e !== eventId);
    const {beforeCode, afterCode} = getCodeBeforeAndAfterOneStep(level, eventId, allEvents.filter(e => e !== eventId));
    if (beforeCode !== afterCode) {
        return {beforeCode, afterCode};
    }
    for (const e of allEvents) {
        const prevEvents = allEvents.filter(ee => ee !== e && ee !== eventId);
        const {beforeCode, afterCode} = getCodeBeforeAndAfterOneStep(level, eventId, prevEvents);
        if (beforeCode !== afterCode) {
            return {beforeCode, afterCode};
        }
    }
    throw new Error(`Cant find what events should be before this: ${eventId}`);
}

function getCodeBeforeAndAfterOneStep(level: LevelData, eventId: string, prevEvents: string[] = []) {
    // Get the code before applying the event
    const beforeState = applyEvents(level.blocks, prevEvents.filter(e => e !== eventId));
    const beforeCode = beforeState.code;
    const afterState = applyEvents(level.blocks, [eventId, ...prevEvents]);
    const afterCode = afterState.code;

    return {beforeCode, afterCode};
}


/**
 * Updates the level with generated hint and explanation for a specific event using the Gemini API
 * @param level The level data to update
 * @param eventId The event ID to generate hint and explanation for
 * @param apiKey The API key for authentication
 * @param model The Gemini model to use
 * @returns The updated level data with generated hint and explanation
 */
async function updateHintAndExplanation(level: LevelData, eventId: string, apiKey: string, model: string): LevelData {
    console.log('Updating hint and explanation for event:', eventId);
    const {beforeCode, afterCode} = getCodeBeforeAndAfter(level, eventId);

    // Construct the prompt for the Gemini API
    const prompt = constructHintAndExplanationPrompt(beforeCode, afterCode);
    console.log(prompt);

    // Call the Gemini API
    try {
        const response = await callGeminiApi(prompt, apiKey, model);
        console.log(response);

        // Parse the response and update the level
        return parseHintAndExplanationResponse(level, eventId, response);
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return level;
    }
}

/**
 * Collects all event IDs from the level
 * @param level The level data
 * @returns Array of all event IDs in the level
 */
function getAllEventIds(level: LevelData): string[] {
    const events = new Set<string>();

    for (const block of level.blocks) {
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

    return Array.from(events);
}

/**
 * Gets the selected Gemini model from local storage or returns the default model
 *
 * NOTE: This function should only be used in the React component for initialization.
 * Do not use it in library functions - instead, pass the model as a parameter.
 *
 * @returns The selected model or the default model if not found
 */
export function getSelectedGeminiModel(): string {
    // For browser environment, get from local storage
    if (typeof window !== 'undefined' && window.localStorage) {
        const model = localStorage.getItem('selectedGeminiModel');
        if (model) {
            return model;
        }
    }

    // Default model
    return 'gemini-2.5-flash-lite';
}

/**
 * Calls the Gemini API with the given prompt
 * @param prompt The prompt to send to the API
 * @param apiKey The API key for authentication
 * @param model The Gemini model to use (defaults to gemini-2.5-flash-lite)
 * @returns The API response
 */
async function callGeminiApi(prompt: string, apiKey: string, model: string = 'gemini-2.5-flash-lite'): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        }
    };

    try {
        const response = await fetch(`${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': apiKey
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Extract the text from the response
        if (data.candidates && data.candidates.length > 0 &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format from Gemini API');
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
}

/**
 * Constructs a prompt for the Gemini API to generate start and final messages
 * @param initialCode The initial code of the level
 * @param finalCode The final code of the level after all events are triggered
 * @returns The prompt for the Gemini API
 */
function constructStartAndFinalPrompt(initialCode: string, finalCode: string): string {
    return `
You are a text  writer for a coding game that teaches clean code principles. 
You have  to write replicas for a Buddy — player's mentor, and a player response replicas.

On each level player has to fix some clean-code issues in the code.
Before the level starts Buddy says a start message to the player.
After player fixes all issues Buddy says a final message to the player.

This is the INITIAL CODE, with issues:
\`\`\`python
${initialCode}
\`\`\`

This is the FINAL CODE (after player fixes all issues):
\`\`\`python
${finalCode}
\`\`\`

Please generate the following messages in JSON format:

0. The list of problems in the code, that was solved in the final code. Do not refer to problems that was not solved in the final code. It is not replicas, they are not visible for the player, just for internal usage — be precise, objective and concise, no sarcasm and humor in this field.

1. startMessage: A smart and slightly sarcastic message from Buddy commenting on the problems in the initial code. This should be 200-400 characters and should NOT provide strong hints about what to fix.

2. startReply: A short player's reply (10-25 characters) that will be the text on the reply button.

3. finalMessage: A message from Buddy after all issues are fixed, commenting on the improvements. This should be 100-300 characters and have educational value.

4. endReply: Text for the "Next" button (10-25 characters) after completing the level.

## Restrictions:

1. Use B1 or B2 level without fancy words. The replicas should be understandable for non native speakers.

Example response format:
{
  "problems": "Variable names do not reflect the meaning of the data and use oversimplified patters for the names.",
  "startMessage": "Behold! Our senior developer's "typing efficiency" naming convention:\n- String variables: 's', 's1', 'ss' (saves keystrokes!)\n- Booleans: always 'flag' (saves thinking time!)\n\nThis is a pure efficiency of x10 developers!",
  "startReply": "Don't think so...",
  "finalMessage": "Not bad! You've transformed this code from a cryptic puzzle into self-documenting code.\nNow anyone reading it can immediately understand what each variable represents without having to trace through the execution.\nRemember: the goal of variable naming isn't to save keystrokes while typing - it's to save brain cycles while reading!",
  "endReply": "Names fixed!"
}
`;
}

/**
 * Parses the Gemini API response and updates the level with the generated messages
 * @param level The level data to update
 * @param response The API response to parse
 * @returns The updated level data
 */
function parseStartAndFinalResponse(level: LevelData, response: string): LevelData {
    try {
        // Try to parse the response as JSON
        let parsedResponse;

        // Extract JSON from the response if it's wrapped in markdown code blocks
        const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?})\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            parsedResponse = JSON.parse(jsonMatch[1]);
        } else {
            // Try to parse the entire response as JSON
            parsedResponse = JSON.parse(response);
        }

        // Create a new level object with the updated messages
        return {
            ...level,
            startMessage: parsedResponse.startMessage || level.startMessage,
            startReply: parsedResponse.startReply || level.startReply,
            finalMessage: parsedResponse.finalMessage || level.finalMessage,
            endReply: parsedResponse.endReply || level.endReply
        };
    } catch (error) {
        console.error('Error parsing Gemini API response:', error);
        console.error('Response:', response);
        return level;
    }
}

/**
 * Constructs a prompt for the Gemini API to generate hint and explanation for a specific event
 * @param beforeCode The code before applying the event
 * @param afterCode The code after applying the event
 * @returns The prompt for the Gemini API
 */
function constructHintAndExplanationPrompt(beforeCode: string, afterCode: string): string {
    return `
You are a text writer for a coding game that teaches clean code principles.
You have to write hints and explanations for a Buddy — player's mentor.

On each level player has to fix some clean-code issues in the code.
When player clicks on a problematic code element, it gets replaced with a better version.
After the replacement, Buddy explains why the change was good.

This is the CODE BEFORE the player fixed a problem in code:
\`\`\`python
${beforeCode}
\`\`\`

This is the CODE AFTER the player fixed the problem:
\`\`\`python
${afterCode}
\`\`\`

Please generate the following in JSON format:

0. change: What exactly changed: describe it in one short sentence. It is not a part of text shown to player, just for internal usage. Be concise and precise, do not use humor or sarcasm in this field.

1. hint: A smart and subtle hint that helps the player identify the code that was changed (see change) without giving away the answer directly. This should be 20-80 characters and should guide the player to look at the right part of the code.

2. explanation: A sarcastic but educational explanation of why the change was good. This should be 50-100 characters and should explain the clean code principle that was applied.

## Restrictions:

1. Use B1 or B2 level without fancy words. The text should be understandable for non-native speakers.
2. The hint should be subtle and not give away the exact solution.
3. The explanation should be educational and explain the clean code principle.

Example response format:
{
  "change": "Undescriptive variable lst1 was renamed to empty_positions.",
  "hint": "What is stored in this list?",
  "explanation": "lst1? Is this a sequel to lst? Variable names should tell a story, not just be numbered placeholders."
}
`;
}

/**
 * Parses the Gemini API response and updates the level with the generated hint and explanation
 * @param level The level data to update
 * @param eventId The event ID to update hint and explanation for
 * @param response The API response to parse
 * @returns The updated level data
 */
function parseHintAndExplanationResponse(level: LevelData, eventId: string, response: string): LevelData {
    try {
        // Try to parse the response as JSON
        let parsedResponse;

        // Extract JSON from the response if it's wrapped in markdown code blocks
        const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?})\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            parsedResponse = JSON.parse(jsonMatch[1]);
        } else {
            // Try to parse the entire response as JSON
            parsedResponse = JSON.parse(response);
        }

        // Find the block with the matching event ID and update its hint and explanation
        const updatedBlocks = level.blocks.map(block => {
            if ((block.type === 'replace' || block.type === 'replace-span') && block.event) {
                // Check if the block's event matches the target event ID
                const eventMatches = typeof block.event === 'string'
                    ? block.event === eventId
                    : block.event.includes(eventId);

                if (eventMatches) {
                    return {
                        ...block,
                        hint: parsedResponse.hint || block.hint,
                        explanation: parsedResponse.explanation || block.explanation
                    };
                }
            }
            return block;
        });

        // Create a new level object with the updated blocks
        return {
            ...level,
            blocks: updatedBlocks
        };
    } catch (error) {
        console.error('Error parsing Gemini API response:', error);
        console.error('Response:', response);
        return level;
    }
}