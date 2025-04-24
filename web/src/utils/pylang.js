import {EventRegion} from "./regions.js";

/**
 * Processes blocks and applies events to generate final code with interactive regions
 *
 * @param {LevelBlock[]} blocks - The code blocks to process
 * @param {string[]} events - List of triggered event IDs
 * @returns {LevelBlock[]} - triggered span replacements
 */
function getTriggeredSpanBlocks(blocks, events) {
    const triggeredSpanReplacements = [];
    for (const block of blocks) {
        if (block.type === 'replace-span' && events.includes(block.event)) {
            triggeredSpanReplacements.push(block);
        }
    }
    return triggeredSpanReplacements;
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
    // First, collect all replace-span operations that have been triggered
    const triggeredSpanBlocks = getTriggeredSpanBlocks(blocks, events);

    // Process each block and apply events
    let finalCode = '';
    let regions = [];
    let lineOffset = 0;

    // Collect replace-span blocks that haven't been triggered
    const pendingReplaceSpans = [];

    for (const block of blocks) {
        let processedText = block.text;
        let processedReplacement = block.replacement;

        if (block.text) {
            processedText = replaceAll(block.text, triggeredSpanBlocks);
        }
        if (block.replacement)
            processedReplacement = replaceAll(block.replacement, triggeredSpanBlocks);

        if (block.type === 'replace-span' && !events.includes(block.event)) {
            pendingReplaceSpans.push(block);
        }

        switch (block.type) {
            case 'text': {
                finalCode += processedText;
                lineOffset += countLines(processedText);
                break;
            }

            case 'replace': {
                const isReplaceTriggered = events.includes(block.event);
                const displayedText = isReplaceTriggered ? processedReplacement : processedText
                finalCode += displayedText;
                const linesCount = countLines(displayedText);

                if (!isReplaceTriggered) {
                    if (block.clickable) {
                        // If there's a specific clickable substring
                        const replaceRegions = findAllSubstringPositions(processedText, block.clickable, lineOffset);

                        for (const region of replaceRegions) {
                            regions.push(new EventRegion(
                                region.startLine,
                                region.startColumn,
                                region.endLine,
                                region.endColumn,
                                block.event
                            ));
                        }
                    } else {
                        // The whole block is clickable
                        regions.push(new EventRegion(
                            lineOffset,
                            0,
                            lineOffset + linesCount - 1,
                            100500,
                            block.event
                        ));
                    }
                    lineOffset += countLines(displayedText);
                }
                break;
            }

            case 'replace-on': {
                const isReplaceTriggered = events.includes(block.event);
                const displayedText = isReplaceTriggered ? processedReplacement : processedText;
                finalCode += displayedText;
                lineOffset += countLines(displayedText);
                break;
            }
        }
    }

    for (const pendingSpan of pendingReplaceSpans) {
        const allOccurrences = findAllSubstringPositions(finalCode, pendingSpan.clickable, 0);

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

    return {
        code: finalCode.replace(/\n$/, ""),
        regions
    };
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
 * @param {number} lineOffset - Line offset to add to resulting positions
 * @returns {Array<{startLine: number, startColumn: number, endLine: number, endColumn: number}>} - Array of positions
 */
function findAllSubstringPositions(text, substring, lineOffset) {
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
                startLine: i + lineOffset,
                startColumn: index,
                endLine: i + lineOffset,
                endColumn: index + substring.length
            });

            position = index + 1; // Move past this occurrence to find the next
        }
    }

    return results;
}
