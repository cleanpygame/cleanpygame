import {EventRegion} from "./regions";
import {LevelBlock} from "../types";

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
    const isEventTriggered = block.event ? events.includes(block.event) : false;
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
                block.event!
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
                block.event!
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
                pendingSpan.event!
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
        if (events.includes(block.event || ''))
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
