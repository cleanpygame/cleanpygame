import {EventRegion} from "./regions";
import {LevelBlock, LevelData} from "../types";

/**
 * Converts a LevelData object to PyLevels format text
 *
 * This function takes a LevelData object and converts it to a string in PyLevels format.
 * It handles all the different block types (text, replace-span, replace, replace-on)
 * and special cases like add-on and remove-on blocks.
 *
 * @param level - The LevelData object to convert
 * @returns - The PyLevels format text
 */
export function renderToPyLevel(level: LevelData): string {
    if (!level || !level.filename) {
        console.error('Invalid level data: missing filename');
        return '';
    }

    const referencedEvents = [];
    for (const block of level.blocks) {
        if (block.type === 'replace-on' || block.type === 'add-on' || block.type === 'remove-on') {
            if (Array.isArray(block.event))
                referencedEvents.push(...block.event);
            else
                referencedEvents.push(block.event);
        }
    }

    let result = '';

    // Add file header (required)
    result += `##file ${level.filename}\n`;

    // Add start message if present (required)
    if (level.startMessage) {
        result += '"""start\n';
        result += level.startMessage + '\n';
        result += '"""\n';

        // Add start reply if present (optional)
        if (level.startReply) {
            result += `##start-reply "${level.startReply}"\n`;
        }
    }

    // Process blocks
    if (level.blocks && level.blocks.length > 0) {
        for (const block of level.blocks) {
            result += renderBlock(block, referencedEvents);
        }
    }

    // Add final message if present (required)
    if (level.finalMessage) {
        result += '"""final\n';
        result += level.finalMessage + '\n';
        result += '"""\n';

        // Add final reply if present (optional)
        if (level.endReply) {
            result += `##final-reply "${level.endReply}"\n`;
        }
    }

    return result;
}

/**
 * Renders a single block to PyLevels format
 *
 * @param block - The block to render
 * @returns - The PyLevels format text for the block
 */
function renderBlock(block: LevelBlock, referencedEvents: any[]): string {
    if (!block || !block.type) {
        return '';
    }

    let result = '';

    switch (block.type) {
        case 'text':
            result = renderTextBlock(block);
            break;

        case 'replace-span':
            result = renderReplaceSpanBlock(block, referencedEvents);
            break;

        case 'replace':
            result = renderReplaceBlock(block, referencedEvents);
            break;

        case 'replace-on':
            result = renderReplaceOnBlock(block);
            break;

        default:
            console.warn(`Unknown block type: ${block.type}`);
            break;
    }

    return result;
}

/**
 * Renders a text block to PyLevels format
 *
 * @param block - The text block to render
 * @returns - The PyLevels format text for the block
 */
function renderTextBlock(block: LevelBlock): string {
    if (!block.text) {
        return '';
    }

    let result = block.text;

    // Ensure there's a newline at the end if not already present
    if (!result.endsWith('\n')) {
        result += '\n';
    }

    return result;
}

function quoteIfNeeded(s: string): string {
    if (s.includes(' ') || s.includes('\n') || s.includes('\t') || s.includes('\r')) {
        const escapedS = s.replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\r/g, '\\r');
        return `"${escapedS}"`;
    }
    return s;
}

function addHintAndExplain(block: LevelBlock, result: string) {
    if (block.hint) {
        result += `##hint ${quoteIfNeeded(block.hint)}\n`;
    }
    if (block.explanation) {
        result += `##explain ${quoteIfNeeded(block.explanation)}\n`;
    }
    return result;
}

function addOptions(block: LevelBlock, result: string) {
    if (block.options && block.options.length > 0) {
        for (const opt of block.options) {
            const correctness = opt.correct ? 'good' : 'bad';
            const id = opt.id || 'id';
            const label = quoteIfNeeded(opt.label || '');
            result += `##option ${correctness} ${id} ${label}\n`;
        }
    }
    return result;
}

/**
 * Renders a replace-span block to PyLevels format
 *
 * @param block - The replace-span block to render
 * @returns - The PyLevels format text for the block
 */
function renderReplaceSpanBlock(block: LevelBlock, referencedEvents: any[]): string {
    // Skip if required fields are missing
    if (!block.event || !block.clickable || !block.replacement) {
        return '';
    }
    const event = referencedEvents.includes(block.event) ? block.event : '-';
    let result = `##replace-span ${event} ${quoteIfNeeded(block.clickable)} ${quoteIfNeeded(block.replacement)}\n`;
    result = addHintAndExplain(block, result);
    result = addOptions(block, result);
    return result;
}

/**
 * Renders a replace block to PyLevels format
 *
 * @param block - The replace block to render
 * @returns - The PyLevels format text for the block
 */
function renderReplaceBlock(block: LevelBlock, referencedEvents: any[]): string {
    // Skip if required fields are missing
    if (!block.event) {
        return '';
    }

    let result = '';

    const event = referencedEvents.includes(block.event) ? block.event : '-';
    // Add replace directive with optional clickable substring
    if (block.clickable) {
        result += `##replace ${event} ${quoteIfNeeded(block.clickable)}\n`;
    } else if (event !== '-') {
        result += `##replace ${event}\n`;
    } else {
        result += `##replace\n`;
    }

    // Add text to replace
    if (block.text) {
        result += block.text;
        // Ensure there's no extra newline
        if (result.endsWith('\n')) {
            result = result.slice(0, -1);
        }
    }

    // Add with directive
    result += '\n##with\n';

    // Add replacement text
    // Note: In JavaScript, an empty string is falsy, so we need to check if block.replacement is defined
    // rather than truthy
    if (block.replacement !== undefined) {
        result += block.replacement;
        // Ensure there's no extra newline
        if (result.endsWith('\n')) {
            result = result.slice(0, -1);
        }
    }

    // Add end directive
    result += '\n##end\n';

    result = addHintAndExplain(block, result);
    result = addOptions(block, result);

    return result;
}

/**
 * Renders a replace-on block to PyLevels format
 *
 * @param block - The replace-on block to render
 * @returns - The PyLevels format text for the block
 */
function renderReplaceOnBlock(block: LevelBlock): string {
    // Skip if required fields are missing
    if (!block.event) {
        return '';
    }

    let result = '';

    // Handle both string and array event types
    const eventStr = Array.isArray(block.event)
        ? block.event.join(' ')
        : block.event;

    // Check if this is actually an add-on or remove-on
    // Note: In JavaScript, empty strings are falsy, so we need to explicitly check for empty strings
    // We also need to check if the property is defined
    const hasEmptyText = block.text === '';
    const hasEmptyReplacement = block.replacement === '';
    const hasText = block.text !== undefined && block.text !== '';
    const hasReplacement = block.replacement !== undefined && block.replacement !== '';

    if (hasEmptyText && hasReplacement) {
        // This is an add-on
        result += `##add-on ${eventStr}\n`;
        result += block.replacement;
        // Ensure there's no extra newline
        if (result.endsWith('\n')) {
            result = result.slice(0, -1);
        }
        result += '\n##end\n';
    } else if (hasText && hasEmptyReplacement) {
        // This is a remove-on
        result += `##remove-on ${eventStr}\n`;
        result += block.text;
        // Ensure there's no extra newline
        if (result.endsWith('\n')) {
            result = result.slice(0, -1);
        }
        result += '\n##end\n';
    } else {
        // This is a regular replace-on
        result += `##replace-on ${eventStr}\n`;
        if (block.text !== undefined) {
            result += block.text;
            // Ensure there's no extra newline
            if (result.endsWith('\n')) {
                result = result.slice(0, -1);
            }
        }
        result += '\n##with\n';
        if (block.replacement !== undefined) {
            result += block.replacement;
            // Ensure there's no extra newline
            if (result.endsWith('\n')) {
                result = result.slice(0, -1);
            }
        }
        result += '\n##end\n';
    }

    return result;
}

/**
 * Processes blocks and applies events to generate final code with interactive regions
 *
 * @param blocks - The code blocks to process
 * @param events - List of triggered event IDs
 * @returns - The resulting code and interactive regions
 */
export function applyEvents(blocks: LevelBlock[], events: string[]): {
    code: string;
    regions: EventRegion[];
} {
    const {pendingSpans, triggeredSpans} = sortSpanBlocks(blocks, events);

    // Create a deep copy of pending spans to avoid modifying the original blocks
    const processedPendingSpans = pendingSpans.map(span => ({...span}));

    // Update clickable text in pending replace-span blocks with triggered replacements
    for (const pendingSpan of processedPendingSpans) {
        if (pendingSpan.clickable) {
            pendingSpan.clickable = replaceAll(pendingSpan.clickable, triggeredSpans);
        }
        if (pendingSpan.replacement) {
            pendingSpan.replacement = replaceAll(pendingSpan.replacement, triggeredSpans);
        }
    }

    // Process blocks to get initial code
    const {code: initialCode, regions} = renderReplaceBlocks(blocks, events, triggeredSpans);

    // Apply triggered span replacements to the entire code
    let processedCode = initialCode;
    for (const triggeredSpan of triggeredSpans) {
        if (triggeredSpan.clickable && triggeredSpan.replacement) {
            processedCode = replaceSubstringWithWordBoundaries(processedCode, triggeredSpan.clickable, triggeredSpan.replacement);
        }
    }

    const spanRegions = getRegionsFromPendingReplaceSpans(processedPendingSpans, processedCode);
    return {
        code: processedCode.replace(/\n$/, ""),
        regions: [...regions, ...spanRegions]
    };
}

/**
 * Process all blocks and collect code and regions
 *
 * @param blocks - The code blocks to process
 * @param events - List of triggered event IDs
 * @param triggeredSpanBlocks - Span blocks that have been triggered
 * @returns - Processing results
 */
function renderReplaceBlocks(blocks: LevelBlock[], events: string[], triggeredSpanBlocks: LevelBlock[]): {
    code: string;
    regions: EventRegion[];
    pendingReplaceSpans: LevelBlock[];
} {
    let finalCode = '';
    let regions: EventRegion[] = [];
    let lineOffset = 0;
    const pendingReplaceSpans: LevelBlock[] = [];

    for (const block of blocks) {
        const processedText = block.text ? replaceAll(block.text, triggeredSpanBlocks) : block.text;
        const processedReplacement = block.replacement ? replaceAll(block.replacement, triggeredSpanBlocks) : block.replacement;
        const processedClickable = block.clickable ? replaceAll(block.clickable, triggeredSpanBlocks) : block.clickable;
        const processedBlock: LevelBlock = {
            ...block,
            clickable: processedClickable,
            text: processedText,
            replacement: processedReplacement
        };
        const result = processBlock(processedBlock, events, lineOffset);

        finalCode += result.text;
        if (result.regions.length > 0) {
            regions = [...regions, ...result.regions];
        }
        lineOffset += countLines(result.text);
    }

    return {code: finalCode, regions, pendingReplaceSpans};
}

/**
 * Process a single block
 *
 * @param block - The block to process
 * @param events - List of triggered event IDs
 * @param lineOffset - Current line offset
 * @returns - Processed text and regions
 */
function processBlock(block: LevelBlock, events: string[], lineOffset: number): {
    text: string;
    regions: EventRegion[];
} {
    // Check if the event is triggered
    // If block.event is an array, check if any of the events in the array are in the events list
    // If block.event is a string, check if it's in the events list
    const isEventTriggered = block.event
        ? Array.isArray(block.event)
            ? block.event.some(e => events.includes(e))
            : events.includes(block.event)
        : false;
    const displayedText = isEventTriggered ? block.replacement || '' : block.text || '';
    switch (block.type) {
        case 'text':
            return {text: block.text || '', regions: []};

        case 'replace': {
            const regions = isEventTriggered ? [] : createRegionsForReplaceBlock(block, isEventTriggered, lineOffset);
            return {text: displayedText, regions};
        }

        case 'replace-on': {
            return {text: displayedText, regions: []};
        }

        default:
            return {text: '', regions: []};
    }
}

/**
 * Create regions for a replace-block
 *
 * @param block - The replace-block
 * @param isTriggered - Whether the event is triggered
 * @param lineOffset - Current line offset
 * @returns - Regions for the block
 */
function createRegionsForReplaceBlock(block: LevelBlock, isTriggered: boolean, lineOffset: number): EventRegion[] {
    if (isTriggered) return [];

    const linesCount = countLines(block.text);

    if (block.clickable) {
        // If there's a specific clickable substring
        const replaceRegions = findAllSubstringPositions(block.text || '', block.clickable);
        return replaceRegions.map(region =>
            new EventRegion(
                region.startLine + lineOffset,
                region.startColumn,
                region.endLine + lineOffset,
                region.endColumn,
                // If block.event is an array, use the first event in the array
                // Otherwise, use the event as is
                Array.isArray(block.event) ? block.event[0] : block.event!
            )
        );
    } else {
        // The whole block is clickable
        return [
            new EventRegion(
                lineOffset,
                0,
                lineOffset + linesCount - 1,
                100500,
                // If block.event is an array, use the first event in the array
                // Otherwise, use the event as is
                Array.isArray(block.event) ? block.event[0] : block.event!
            )
        ];
    }
}

/**
 * Process pending replace spans
 *
 * @param pendingReplaceSpans - Pending replace span blocks
 * @param code - The final code
 * @returns - Regions for the pending spans
 */
function getRegionsFromPendingReplaceSpans(pendingReplaceSpans: LevelBlock[], code: string): EventRegion[] {
    const regions: EventRegion[] = [];

    for (const pendingSpan of pendingReplaceSpans) {
        if (!pendingSpan.clickable) continue;

        const allOccurrences = findAllSubstringPositions(code, pendingSpan.clickable);

        for (const occurrence of allOccurrences) {
            regions.push(new EventRegion(
                occurrence.startLine,
                occurrence.startColumn,
                occurrence.endLine,
                occurrence.endColumn,
                // If pendingSpan.event is an array, use the first event in the array
                // Otherwise, use the event as is
                Array.isArray(pendingSpan.event) ? pendingSpan.event[0] : pendingSpan.event!
            ));
        }
    }

    return regions;
}

/**
 * Helper function to replace all occurrences of a substring
 * Only replaces substrings with word boundaries around them
 *
 * @param text - Original text
 * @param spanReplacementBlocks - Blocks with replacements
 * @returns - Text with all occurrences replaced
 */
export function replaceAll(text: string, spanReplacementBlocks: LevelBlock[]): string {
    let result = text;
    for (const spanBlock of spanReplacementBlocks) {
        if (!result || !spanBlock.clickable || !spanBlock.replacement) continue;
        result = replaceSubstringWithWordBoundaries(result, spanBlock.clickable, spanBlock.replacement);
    }
    return result;
}

/**
 * Helper function to replace all occurrences of a substring with word boundaries
 *
 * @param text - Original text
 * @param substring - The substring to replace
 * @param replacement - The replacement string
 * @returns - Text with all occurrences replaced
 */
export function replaceSubstringWithWordBoundaries(text: string, substring: string, replacement: string): string {
    if (!text || !substring) return text;

    // Helper function to check if a character is a word character (letter, number, or underscore)
    const isWordChar = (char: string | undefined): boolean => {
        if (!char) return false;
        return /\w/.test(char);
    };

    const lines = text.split('\n');
    const resultLines = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let resultLine = '';
        let lastIndex = 0;

        // Find all occurrences in this line
        while (true) {
            const index = line.indexOf(substring, lastIndex);
            if (index === -1) break;

            // Check for word boundaries
            const charBefore = index > 0 ? line[index - 1] : undefined;
            const charAfter = index + substring.length < line.length ? line[index + substring.length] : undefined;

            // Only replace if there are word boundaries (non-word characters or start/end of line) before and after
            if (!isWordChar(charBefore) && !isWordChar(charAfter)) {
                resultLine += line.substring(lastIndex, index) + replacement;
                lastIndex = index + substring.length;
            } else {
                resultLine += line.substring(lastIndex, index + 1);
                lastIndex = index + 1;
            }
        }

        resultLine += line.substring(lastIndex);
        resultLines.push(resultLine);
    }

    return resultLines.join('\n');
}

/**
 * Helper function to find all positions of a substring within text
 * Only finds substrings with word boundaries around them
 *
 * @param text - The full text to search in
 * @param substring - The substring to find
 * @returns - Array of positions
 */
export function findAllSubstringPositions(text: string, substring: string): Array<{
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}> {
    if (!text || !substring) return [];

    const results: Array<{
        startLine: number;
        startColumn: number;
        endLine: number;
        endColumn: number;
    }> = [];
    const lines = text.split('\n');

    // Helper function to check if a character is a word character (letter, number, or underscore)
    const isWordChar = (char: string | undefined): boolean => {
        if (!char) return false;
        return /\w/.test(char);
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let position = 0;

        // Find all occurrences in this line
        while (true) {
            const index = line.indexOf(substring, position);
            if (index === -1) break;

            // Check for word boundaries
            const charBefore = index > 0 ? line[index - 1] : undefined;
            const charAfter = index + substring.length < line.length ? line[index + substring.length] : undefined;

            // Only add if there are word boundaries (non-word characters or start/end of line) before and after
            if (!isWordChar(charBefore) && !isWordChar(charAfter)) {
                results.push({
                    startLine: i,
                    startColumn: index,
                    endLine: i,
                    endColumn: index + substring.length
                });
            }

            position = index + 1; // Move past this occurrence to find the next
        }
    }

    return results;
}

/**
 * Processes blocks and applies events to generate final code with interactive regions
 *
 * @param blocks - The code blocks to process
 * @param events - List of triggered event IDs
 * @returns - triggered span replacements
 */
function sortSpanBlocks(blocks: LevelBlock[], events: string[]): {
    triggeredSpans: LevelBlock[];
    pendingSpans: LevelBlock[];
} {
    const triggered: LevelBlock[] = [];
    const pending: LevelBlock[] = [];
    for (const block of blocks) {
        if (block.type !== 'replace-span') continue;

        // Check if the block's event is triggered
        // If block.event is an array, check if any of the events in the array are in the events list
        // If block.event is a string, check if it's in the events list
        const isTriggered = block.event
            ? Array.isArray(block.event)
                ? block.event.some(e => events.includes(e))
                : events.includes(block.event)
            : false;

        if (isTriggered)
            triggered.push(block);
        else
            pending.push(block);
    }
    return {triggeredSpans: triggered, pendingSpans: pending};
}

function countLines(text: string | undefined): number {
    if (!text) return 0;
    let count = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '\n') {
            count++;
        }
    }
    return count;
}
