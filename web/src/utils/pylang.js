import {EventRegion} from "./regions.js";

/**
 * Processes blocks and applies events to generate final code with interactive regions
 *
 * @param {LevelBlock[]} blocks - The code blocks to process
 * @param {string[]} events - List of triggered event IDs
 * @returns {{triggeredSpans: LevelBlock[], pendingSpans: LevelBlock[]}} - triggered span replacements
 */
function sortSpanBlocks(blocks, events) {
    const triggered = [];
    const pending = [];
    for (const block of blocks) {
        if (block.type !== 'replace-span') continue;
        if (events.includes(block.event))
            triggered.push(block);
        else
            pending.push(block);
    }
    return {triggeredSpans: triggered, pendingSpans: pending};
}


function countLines(text) {
    if (!text) return 0;
    let count = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '\n') {
            count++;
        }
    }
    return count;
}

/**
 * Processes blocks and applies events to generate final code with interactive regions
 *
 * @param {LevelBlock[]} blocks - The code blocks to process
 * @param {string[]} events - List of triggered event IDs
 * @returns {{code: string, regions: EventRegion[]}} - The resulting code and interactive regions
 */
export function applyEvents(blocks, events) {
    const {pendingSpans, triggeredSpans} = sortSpanBlocks(blocks, events);
    const { code, regions} = renderReplaceBlocks(blocks, events, triggeredSpans);
    const spanRegions = getRegionsFromPendingReplaceSpans(pendingSpans, code);
    return {
        code: code.replace(/\n$/, ""),
        regions: [...regions, ...spanRegions]
    };
}

/**
 * Process all blocks and collect code and regions
 * 
 * @param {LevelBlock[]} blocks - The code blocks to process
 * @param {string[]} events - List of triggered event IDs
 * @param {LevelBlock[]} triggeredSpanBlocks - Span blocks that have been triggered
 * @returns {{code: string, regions: EventRegion[], pendingReplaceSpans: LevelBlock[]}} - Processing results
 */
function renderReplaceBlocks(blocks, events, triggeredSpanBlocks) {
    let finalCode = '';
    let regions = [];
    let lineOffset = 0;
    const pendingReplaceSpans = [];

    for (const block of blocks) {
        const processedText = block.text ? replaceAll(block.text, triggeredSpanBlocks) : block.text;
        const processedReplacement = block.replacement ? replaceAll(block.replacement, triggeredSpanBlocks) : block.replacement;
        const processedBlock = /** @type {LevelBlock} */ {...block, text: processedText, replacement: processedReplacement};
        const result = processBlock(processedBlock, events, lineOffset);

        finalCode += result.text;
        if (result.regions.length > 0) {
            regions = [...regions, ...result.regions];
        }
        lineOffset += countLines(result.text);
    }

    return { code: finalCode, regions, pendingReplaceSpans };
}

/**
 * Process a single block
 * 
 * @param {LevelBlock} block - The block to process
 * @param {string[]} events - List of triggered event IDs
 * @param {number} lineOffset - Current line offset
 * @returns {{text: string, regions: EventRegion[]}} - Processed text and regions
 */
function processBlock(block, events, lineOffset) {
    const isEventTriggered = block.event ? events.includes(block.event) : false;
    const displayedText = isEventTriggered ? block.replacement : block.text;
    switch (block.type) {
        case 'text':
            return { text: block.text, regions: [] };

        case 'replace': {
            const regions = isEventTriggered ? [] : createRegionsForReplaceBlock(block, isEventTriggered, lineOffset);
            return { text: displayedText, regions };
        }

        case 'replace-on': {
            return { text: displayedText, regions: [] };
        }

        default:
            return { text: '', regions: [] };
    }
}

/**
 * Create regions for a replace-block
 *
 * @param {LevelBlock} block - The replace-block
 * @param {Boolean} isTriggered
 * @param {number} lineOffset - Current line offset
 * @returns {EventRegion[]} - Regions for the block
 */
function createRegionsForReplaceBlock(block, isTriggered, lineOffset) {
    if (isTriggered) return [];

    const linesCount = countLines(block.text);

    if (block.clickable) {
        // If there's a specific clickable substring
        const replaceRegions = findAllSubstringPositions(block.text, block.clickable);
        return replaceRegions.map(region => 
            new EventRegion(
                region.startLine + lineOffset,
                region.startColumn,
                region.endLine + lineOffset,
                region.endColumn,
                block.event
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
                block.event
            )
        ];
    }
}

/**
 * Process pending replace spans
 * 
 * @param {LevelBlock[]} pendingReplaceSpans - Pending replace span blocks
 * @param {string} code - The final code
 * @returns {EventRegion[]} - Regions for the pending spans
 */
function getRegionsFromPendingReplaceSpans(pendingReplaceSpans, code) {
    const regions = [];

    for (const pendingSpan of pendingReplaceSpans) {
        const allOccurrences = findAllSubstringPositions(code, pendingSpan.clickable);

        for (const occurrence of allOccurrences) {
            regions.push(new EventRegion(
                occurrence.startLine,
                occurrence.startColumn,
                occurrence.endLine,
                occurrence.endColumn,
                pendingSpan.event
            ));
        }
    }

    return regions;
}

/**
 * Helper function to replace all occurrences of a substring
 *
 * @param {string} text - Original text
 * @param {LevelBlock[]} spanReplacementBlocks
 * @returns {string} - Text with all occurrences replaced
 */
function replaceAll(text, spanReplacementBlocks) {
    for(const spanBlock of spanReplacementBlocks) {
        if (!text) return text;
        text = text.split(spanBlock.clickable).join(spanBlock.replacement);
    }
    return text;
}

/**
 * Helper function to find all positions of a substring within text
 *
 * @param {string} text - The full text to search in
 * @param {string} substring - The substring to find
 * @returns {Array<{startLine: number, startColumn: number, endLine: number, endColumn: number}>} - Array of positions
 */
function findAllSubstringPositions(text, substring) {
    if (!text || !substring) return [];

    const results = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let position = 0;

        // Find all occurrences in this line
        while (true) {
            const index = line.indexOf(substring, position);
            if (index === -1) break;

            results.push({
                startLine: i,
                startColumn: index,
                endLine: i,
                endColumn: index + substring.length
            });

            position = index + 1; // Move past this occurrence to find the next
        }
    }

    return results;
}
