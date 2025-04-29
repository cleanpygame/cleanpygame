import * as fs from 'fs';
import type {LevelBlock, LevelData} from '../web/src/types.js'
import {v4 as uuid_v4} from 'uuid'

export interface ParseContext {
    filename: string;
    lines: string[];
    idx: number;
    level: LevelData;
}

// Helper functions
export function cleanArg(s: string): string {
    // First remove surrounding quotes
    const trimmed = s.trim().replace(/^"(.*)"$/, '$1');
    // Then replace escaped quotes with just quotes
    return trimmed.replace(/\\"/g, '"');
}

export function parseDirective(context: ParseContext): [string, string[]] {
    const line = context.lines[context.idx].trim();
    if (!line.startsWith('##')) {
        throw errorWithContext(`Invalid directive format: ${line}`, context);
    }

    try {
        // Split into directive and rest
        const parts = line.split(/\s+/);
        const cmd = parts[0].substring(2);
        const argString = parts.slice(1).join(' ');

        const args: string[] = [];
        let currentArg = '';
        let inQuotes = false;

        for (let i = 0; i < argString.length; i++) {
            const char = argString[i];

            if (char === '"' && (i === 0 || argString[i - 1] !== '\\')) {
                inQuotes = !inQuotes;
            } else if (char === '"' && i > 0 && argString[i - 1] === '\\') {
                // Handle escaped quotes by removing the backslash and adding just the quote
                currentArg = currentArg.slice(0, -1) + '"';
            } else if (char === ' ' && !inQuotes) {
                if (currentArg) {
                    args.push(currentArg);
                    currentArg = '';
                }
            } else {
                currentArg += char;
            }
        }

        if (currentArg) {
            args.push(currentArg);
        }

        return [cmd, args];
    } catch (e) {
        throw errorWithContext(`Failed to parse directive: ${line}\n${e}`, context);
    }
}

export function collectBlockUntil(context: ParseContext, endDirective: string): string {
    let block = '';
    while (context.idx < context.lines.length && !context.lines[context.idx].trim().startsWith(`##${endDirective}`)) {
        const line = context.lines[context.idx].replace(/\r?\n$/, '');
        if (line.startsWith('##')) {
            throw errorWithContext(`Missing ##${endDirective} directive? Or what?!`, context);
        }
        block += line + '\n';
        context.idx++;
    }

    if (context.idx >= context.lines.length) {
        throw errorWithContext(`Missing ##${endDirective} directive`, context);
    }
    context.idx++;
    return block;
}

// Directive handlers
export function readWisdoms(args: string[], context: ParseContext): void {
    context.level.wisdoms = args;
    context.idx++;
}

export function readTextBlock(context: ParseContext): void {
    const textBlock: string[] = [];
    while (context.idx < context.lines.length && !context.lines[context.idx].startsWith('##')) {
        textBlock.push(context.lines[context.idx].replace(/\r?\n$/, ''));
        context.idx++;
    }

    if (textBlock.length > 0) {
        context.level.blocks.push({
            type: 'text',
            text: textBlock.join('\n') + '\n'
        });
    }
}

export function readReplaceSpan(args: string[], context: ParseContext): void {
    if (args.length !== 3) {
        throw errorWithContext('##replace-span requires 3 arguments: event, clickable, replacement', context);
    }

    const event = args[0] !== '-' ? args[0] : uuid_v4();
    const block: LevelBlock = {
        type: 'replace-span',
        clickable: cleanArg(args[1]),
        replacement: cleanArg(args[2]),
        event
    };

    context.level.blocks.push(block);
    context.idx++;
}

export function readReplace(args: string[], context: ParseContext): void {
    if (args.length > 2) {
        throw errorWithContext('##replace requires zero, one or two arguments: event and clickable', context);
    }

    const event = (args.length > 0 && args[0] !== '-') ? args[0] : uuid_v4();
    const clickable = args.length > 1 ? args[1] : undefined;

    context.idx++;
    const text = collectBlockUntil(context, 'with');

    const replacement = collectBlockUntil(context, 'end');

    const block: LevelBlock = {
        type: 'replace',
        text,
        replacement,
        event
    };

    if (clickable) {
        block.clickable = cleanArg(clickable);
    }

    context.level.blocks.push(block);
}

export function readReplaceOn(args: string[], context: ParseContext): void {
    if (args.length !== 1) {
        throw errorWithContext('##replace-on requires exactly one argument: event', context);
    }

    const event = args[0];
    context.idx++;

    const text = collectBlockUntil(context, 'with');

    const replacement = collectBlockUntil(context, 'end');

    const block: LevelBlock = {
        type: 'replace-on',
        text,
        replacement,
        event
    };

    context.level.blocks.push(block);
}

export function readAddOn(args: string[], context: ParseContext): void {
    if (args.length !== 1) {
        throw errorWithContext('##add-on requires exactly one argument: event', context);
    }

    const event = args[0];
    context.idx++;

    const lines = collectBlockUntil(context, 'end');

    const block: LevelBlock = {
        type: 'replace-on',
        event,
        text: '',
        replacement: lines
    };

    context.level.blocks.push(block);
}

export function readRemoveOn(args: string[], context: ParseContext): void {
    if (args.length !== 1) {
        throw errorWithContext('##remove-on requires exactly one argument: event', context);
    }

    const event = args[0];
    context.idx++;

    const lines = collectBlockUntil(context, 'end');

    const block: LevelBlock = {
        type: 'replace-on',
        event,
        text: lines,
        replacement: ''
    };

    context.level.blocks.push(block);
}

export function readNeutral(args: string[], context: ParseContext): void {
    if (args.length !== 1) {
        throw errorWithContext('##neutral requires exactly one argument: clickable', context);
    }

    const block: LevelBlock = {
        type: 'neutral',
        clickable: cleanArg(args[0])
    };

    context.level.blocks.push(block);
    context.idx++;
}

export function readExplain(args: string[], context: ParseContext): void {
    if (args.length !== 1) {
        throw errorWithContext('##explain requires exactly one argument: explanation', context);
    }

    if (context.level.blocks.length === 0) {
        throw errorWithContext('##explain must follow a block', context);
    }

    const prevBlock = context.level.blocks[context.level.blocks.length - 1];
    if (prevBlock.type !== 'replace' && prevBlock.type !== 'replace-span' && prevBlock.type !== 'neutral') {
        throw errorWithContext(`##explain cannot follow block of type: ${prevBlock.type}`, context);
    }

    prevBlock.explanation = cleanArg(args.join(' '));
    context.idx++;
}

export function readHint(args: string[], context: ParseContext): void {
    if (args.length !== 1) {
        throw errorWithContext('##hint requires exactly one argument: hint', context);
    }

    if (context.level.blocks.length === 0) {
        throw errorWithContext('##hint must follow a block', context);
    }

    const prevBlock = context.level.blocks[context.level.blocks.length - 1];
    if (prevBlock.type !== 'replace' && prevBlock.type !== 'replace-span') {
        throw errorWithContext(`##hint cannot follow block of type: ${prevBlock.type}`, context);
    }

    prevBlock.hint = cleanArg(args.join(' '));
    context.idx++;
}

export function readReply(args: string[], context: ParseContext): void {
    if (!args || args.length !== 1) {
        throw errorWithContext('##reply requires exactly one argument: reply', context);
    }

    context.level.chat.reply = cleanArg(args.join(' '));
    context.idx++;
}

function errorWithContext(message: string, context: ParseContext): Error {
    return new Error(message + `. Line ${context.idx} in file ${context.filename}`);
}

export function readLevel(args: string[], context: ParseContext): void {
    if (args.length !== 1) {
        throw errorWithContext('##level must have exactly one argument', context);
    }

    context.level.filename = args[0];
    context.idx++;

    if (context.idx < context.lines.length) {
        const currentLine = context.lines[context.idx].trim();
        const buddyPrefix = '"""buddy';

        if (currentLine.startsWith(buddyPrefix)) {
            const buddyMessage: string[] = [];
            context.idx++;

            while (context.idx < context.lines.length && !context.lines[context.idx].trim().endsWith('"""')) {
                buddyMessage.push(context.lines[context.idx].replace(/\r?\n$/, ''));
                context.idx++;
            }

            if (context.idx < context.lines.length) {
                context.idx++;
            }

            context.level.chat.buddy = buddyMessage.join('\n').trim();
        }
    }
}

function readOneBlock(context: ParseContext) {
    const line = context.lines[context.idx];
    if (!line.startsWith('##')) {
        readTextBlock(context);
        return;
    }
    const [cmd, args] = parseDirective(context);
    switch (cmd) {
        case 'level':
            readLevel(args, context);
            break;
        case 'wisdoms':
            readWisdoms(args, context);
            break;
        case 'replace-span':
            readReplaceSpan(args, context);
            break;
        case 'replace':
            readReplace(args, context);
            break;
        case 'replace-on':
            readReplaceOn(args, context);
            break;
        case 'add-on':
            readAddOn(args, context);
            break;
        case 'remove-on':
            readRemoveOn(args, context);
            break;
        case 'neutral':
            readNeutral(args, context);
            break;
        case 'explain':
            readExplain(args, context);
            break;
        case 'hint':
            readHint(args, context);
            break;
        case 'reply':
            readReply(args, context);
            break;
        case 'end':
            context.idx = context.lines.length;
            break
        default:
            throw errorWithContext(`Unknown ##${cmd}`, context);
    }
}

// Main parsing function
export function parseLevelFile(filePath: string): LevelData | undefined {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);

    const outputLevel: LevelData = {
        filename: "",
        wisdoms: [],
        blocks: [],
        chat: {
            buddy: "",
            reply: undefined
        }
    };

    const context: ParseContext = {
        filename: filePath,
        lines,
        idx: 0,
        level: outputLevel
    };

    while (context.idx < lines.length) {
        readOneBlock(context);
    }
    return context.level;
}
