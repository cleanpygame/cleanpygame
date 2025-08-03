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
 * JSON schema for start and final messages
 */
const startFinalMessagesSchema = {
    "type": "OBJECT",
    "properties": {
        "analysis": {
            "type": "STRING"
        },
        "problems": {
            "type": "STRING"
        },
        "startMessage": {
            "type": "STRING"
        },
        "startReply": {
            "type": "STRING"
        },
        "finalMessage": {
            "type": "STRING"
        },
        "endReply": {
            "type": "STRING"
        }
    },
    "required": ["analysis", "problems", "startMessage", "startReply", "finalMessage", "endReply"],
    "propertyOrdering": ["analysis", "problems", "startMessage", "startReply", "finalMessage", "endReply"]
};

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

    // Get system prompt and user prompt
    const {systemPrompt, userPrompt} = constructStartAndFinalPrompt(initialCode, finalCode);
    console.log("System prompt:", systemPrompt);
    console.log("User prompt:", userPrompt);

    // Call the Gemini API with structured output
    const response = await callGeminiApi(userPrompt, apiKey, model, systemPrompt, startFinalMessagesSchema);
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
 * JSON schema for hint and explanation
 */
const hintExplanationSchema = {
    "type": "object",
    "properties": {
        "analysis": {
            "type": "string"
        },
        "change": {
            "type": "string"
        },
        "hint": {
            "type": "string"
        },
        "explanation": {
            "type": "string"
        }
    },
    "required": ["analysis", "change", "hint", "explanation"],
    "propertyOrdering": ["analysis", "change", "hint", "explanation"]
};

/**
 * Updates the level with generated hint and explanation for a specific event using the Gemini API
 * @param level The level data to update
 * @param eventId The event ID to generate hint and explanation for
 * @param apiKey The API key for authentication
 * @param model The Gemini model to use
 * @returns The updated level data with generated hint and explanation
 */
async function updateHintAndExplanation(level: LevelData, eventId: string, apiKey: string, model: string): Promise<LevelData> {
    console.log('Updating hint and explanation for event:', eventId);
    const {beforeCode, afterCode} = getCodeBeforeAndAfter(level, eventId);

    // Get system prompt and user prompt
    const {systemPrompt, userPrompt} = constructHintAndExplanationPrompt(beforeCode, afterCode);
    console.log("System prompt:", systemPrompt);
    console.log("User prompt:", userPrompt);

    // Call the Gemini API with structured output
    try {
        const response = await callGeminiApi(userPrompt, apiKey, model, systemPrompt, hintExplanationSchema);
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

function extractResponse(data: any, jsonSchema?: object): any {
    // Extract the text or structured content from the response
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
        if (jsonSchema) {
            // For structured output, return the structured content
            if (data.candidates[0].content.parts &&
                data.candidates[0].content.parts.length > 0 &&
                data.candidates[0].content.parts[0].structuredValue) {
                return data.candidates[0].content.parts[0].structuredValue;
            }
        }

        // For text output, return the text content
        if (data.candidates[0].content.parts &&
            data.candidates[0].content.parts.length > 0 &&
            data.candidates[0].content.parts[0].text) {
            return JSON.parse(data.candidates[0].content.parts[0].text);
        }

        throw new Error('Response does not contain expected content format');
    } else {
        throw new Error('Invalid response format from Gemini API');
    }
}

async function callGeminiApi(
    prompt: string,
    apiKey: string,
    model: string = 'gemini-2.5-flash-lite',
    systemPrompt: string,
    jsonSchema: object
): Promise<any> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const requestBody: any = {
        system_instruction: {
            parts: [
                {
                    text: systemPrompt
                }
            ]
        },
        contents: [{
            parts: [
                {
                    text: prompt
                }]
        }],
        generationConfig: {
            temperature: 0.6,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 10000,
            responseMimeType: "application/json",
            responseSchema: jsonSchema
        }
    };
    console.log("Request to Gemini API: ", requestBody);

    const response = await fetch(`${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        let errorDescription = await response.text()
        console.error(errorDescription);
        throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const responseObject = extractResponse(data, jsonSchema);
    console.log("Response from Gemini API: ", responseObject);
    return responseObject;
}

/**
 * Constructs system and user prompts for the Gemini API to generate start and final messages
 * @param initialCode The initial code of the level
 * @param finalCode The final code of the level after all events are triggered
 * @returns Object containing system prompt and user prompt
 */
function constructStartAndFinalPrompt(initialCode: string, finalCode: string): {
    systemPrompt: string,
    userPrompt: string
} {
    const systemPrompt = `
You are a text writer for a coding game that teaches clean code principles. 
You write replicas for a Buddy — player's mentor, and player response replicas.

On each level, the player receives a code, written by some other programmer, and has to fix clean-code issues in the code.
Before the level starts, Buddy says a start message to the player.
After the player fixes all issues, Buddy says a final message.

As a reply, generate a json response with the following fields:

1. analysis. Internal analysis of the initial and final code in the free form. This analysis should help to generate further replicas.
2. problems. Internal field. A list of problems in the code that were solved. Be precise and objective. 
3. startMessage. A smart, funny, sarcastic start message from Buddy, commenting the initial code (150-400 characters). Add newLine character ('\n') after each sentence to split the message into multiple lines.
4. startReply. A short player reply (10-25 characters) for the reply button
5. finalMessage. Smart, funny, sarcastic but educational final message from Buddy, commenting the change from the initial to the final code (100-300 characters)
6. endReply. Text for the "Next" button (10-25 characters). Add newLine character ('\n') after each sentence to split the message into multiple lines.

Use B1 or B2 level English without fancy words. The text should be understandable for non-native speakers.
`;

    const userPrompt = `
I need to generate messages for a level in our clean code game.

This is the INITIAL CODE with issues:
\`\`\`python
${initialCode}
\`\`\`

This is the FINAL CODE after all issues are fixed:
\`\`\`python
${finalCode}
\`\`\`

Please analyze the differences and generate appropriate messages that will help players understand the clean code principles being taught.

`;

    return {systemPrompt, userPrompt};
}

function parseStartAndFinalResponse(level: LevelData, parsedResponse: any): LevelData {
    try {
        return {
            ...level,
            startMessage: parsedResponse.startMessage || level.startMessage,
            startReply: parsedResponse.startReply || level.startReply,
            finalMessage: parsedResponse.finalMessage || level.finalMessage,
            endReply: parsedResponse.endReply || level.endReply
        };
    } catch (error) {
        console.error('Error parsing Gemini API response:', error);
        console.error('Response:', parsedResponse);
        return level;
    }
}

/**
 * Constructs system and user prompts for the Gemini API to generate hint and explanation for a specific event
 * @param beforeCode The code before applying the event
 * @param afterCode The code after applying the event
 * @returns Object containing system prompt and user prompt
 */
function constructHintAndExplanationPrompt(beforeCode: string, afterCode: string): {
    systemPrompt: string,
    userPrompt: string
} {
    const systemPrompt = `
You are a text writer for a coding game that teaches clean code principles.
You write hints and explanations for a Buddy — player's mentor.

On each level, the player has to fix clean-code issues in the code.
When a player clicks on a problematic code element, it gets replaced with a better version.
After the replacement, Buddy explains why the change was good.

As a reply, generate a json response with the following fields:

1. analysis. Internal analysis of the initial and final code in the free form. This analysis should help to generate further replicas.
2. changes. A concise description of what changed in the code. This text should help to generate further replicas.
2. hint.A subtle hint to help the player identify the problematic code (20-80 characters). The hint should be subtle and not give away the exact solution. In particular, MUST NOT mention any identifiers from the code.
3. explanation. A sarcastic but educational explanation of why the change was good (50-100 characters)

Use B1 or B2 level English without fancy words. The text should be understandable for non-native speakers.

The explanation should be educational and explain the clean code principle that was applied.
`;

    const userPrompt = `
I need to generate a hint and explanation for a specific code change in our clean code game.

This is the CODE BEFORE the player fixed the problem:
\`\`\`python
${beforeCode}
\`\`\`

This is the CODE AFTER the player fixed the problem:
\`\`\`python
${afterCode}
\`\`\`

Please analyze the differences and generate an appropriate hint and explanation that will help players understand the clean code principle being taught.
`;

    return {systemPrompt, userPrompt};
}

function parseHintAndExplanationResponse(level: LevelData, eventId: string, parsedResponse: any): LevelData {
    try {
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
        console.error('Response:', parsedResponse);
        return level;
    }
}

/**
 * JSON schema for random Python code generation
 */
const randomPythonCodeSchema = {
    "type": "object",
    "properties": {
        "candidates": {
            "type": "ARRAY",
            "items": {
                "type": "STRING"
            }
        },
        "analysis": {
            "type": "string"
        },
        "details": {
            "type": "string"
        },
        "pythonCode": {
            "type": "string"
        },
        "filename": {
            "type": "string"
        }
    },
    "required": ["candidates", "analysis", "details", "pythonCode", "filename"],
    "propertyOrdering": ["candidates", "analysis", "details", "pythonCode", "filename"]
};

/**
 * Generates random Python code with the specified code style issue
 * @param codeStyleIssue Description of the code style issue to include in the generated code
 * @param apiKey The Gemini API key
 * @param model The Gemini model to use
 * @returns The generated Python code
 */
export async function generateRandomPythonCode(codeStyleIssue: string, apiKey: string, model: string): Promise<string> {
    // Construct the system prompt
    const systemPrompt = `
You are a Python code generator for an educational game that teaches clean code principles.
Your task is to generate Python code examples that demonstrate specific code style issues.
The code should be realistic and demonstrate the requested code style issue clearly.
The code should be 10-30 lines long and should be a complete, working Python program.
Do not include comments that explain what the code, unless comments are related to the specific code style issue (e.g. unnecessary or outdated comments).


Big bonus if the code also demonstrate some classic computer science algorithms, approaches and data structures.
Small bonus if the code also demonstrate some typical contexts of the Python applications: web-dev, data analysis, machine learning, etc.

To generate the code you are goring to follow this algorithm:
1. generate a set of candidate descriptions: one sentence describing each idea.
2. analyse the candidates in a free form to select the best one.
3. Elaborate on the best candidate. Add more detail to the description.
4. Generate the Python code based on the final description.
5. Give a filename for the code.

As a reply, generate a JSON response with the following fields:

1. candidates — an array of 5 candidate descriptions. 
2. analysis — internal analysis of the candidates.
3. details — internal analysis of the final candidate.
4. pythonCode — The final generated Python code that demonstrates the requested code style issue.
5. filename — possible filename for this piece of code.
`;

    // Construct the user prompt
    const userPrompt = `
Please generate a Python code example that demonstrates the following code style issue:

${codeStyleIssue}

The code should be realistic and demonstrate the issue clearly. Make sure the code is syntactically correct and would run without errors.
`;

    try {
        const parsedResponse: any = await callGeminiApi(userPrompt, apiKey, model, systemPrompt, randomPythonCodeSchema);
        const parts = [
            "##file " + parsedResponse.filename,
            '"""start',
            "TODO",
            '"""',
            parsedResponse.pythonCode,
            '"""final',
            'TODO',
            '"""'
        ];
        return parts.join('\n');
    } catch (error) {
        console.error('Error generating random Python code:', error);
        throw error;
    }
}