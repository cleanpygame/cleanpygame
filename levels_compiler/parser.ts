import * as fs from 'fs';
import type {LevelBlock, LevelData} from '../web/src/types.js'

export interface ParseContext {
    filename: string;
    lines: string[];
    idx: number;
    level: LevelData;
}

// Helper functions
export function cleanArg(s: string): string {
    // First, remove surrounding quotes
    const trimmed = s.trim().replace(/^"(.*)"$/, '$1');
    // Then replace escaped quotes with just quotes
    return trimmed.replace(/\\"/g, '"');
}

function parseArgsList(argString: string) {
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
    return args;
}

export function parseDirective(context: ParseContext): [string, string[]] {
    const line = context.lines[context.idx].trim();
    try {
        let content = undefined;
        if (line.startsWith('"""') && line.length > 3) {
            // multiline string block
            content = line.substring(3);
        } else if (line.startsWith('##')) {
            content = line.substring(2);
        }
        if (content === undefined) {
            // plain text block
            return ["", []]
        }
        // Split into directive and rest
        const parts = content.split(/\s+/);
        const cmd = parts[0];
        const argString = parts.slice(1).join(' ');
        const args = parseArgsList(argString);

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
export function readWisdoms(args: string[], context: ParseContext): string[] {
    context.idx++;
    return args;
}

export function readTextBlock(context: ParseContext): LevelBlock {
    const textBlock: string[] = [];
    while (context.idx < context.lines.length && !context.lines[context.idx].startsWith('##')) {
        textBlock.push(context.lines[context.idx].replace(/\r?\n$/, ''));
        context.idx++;
    }

    return {
        type: 'text',
        text: textBlock.join('\n') + '\n'
    };
}

export function readReplaceSpan(args: string[], context: ParseContext): LevelBlock {
    if (args.length !== 3) {
        throw errorWithContext('##replace-span requires 3 arguments: event, clickable, replacement', context);
    }

    const clickable = cleanArg(args[1]);
    const event = args[0] !== '-' ? args[0] : generateId(clickable);
    const block: LevelBlock = {
        type: 'replace-span',
        clickable,
        replacement: cleanArg(args[2]),
        event
    };

    context.idx++;
    return block;
}

export function readReplace(args: string[], context: ParseContext): LevelBlock {
    if (args.length > 2) {
        throw errorWithContext('##replace requires zero, one or two arguments: event and clickable', context);
    }

    const clickable = args.length > 1 ? args[1] : undefined;
    const event = (args.length > 0 && args[0] !== '-') ? args[0] : generateId(clickable);

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

    return block;
}

export function readReplaceOn(args: string[], context: ParseContext): LevelBlock {
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

    return block;
}

export function readAddOn(args: string[], context: ParseContext): LevelBlock {
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

    return block;
}

export function readRemoveOn(args: string[], context: ParseContext): LevelBlock {
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

    return block;
}

export function readExplain(args: string[], context: ParseContext): string {
    if (args.length !== 1) {
        throw errorWithContext('##explain requires exactly one argument: explanation', context);
    }

    context.idx++;
    return cleanArg(args.join(' '));
}

export function readHint(args: string[], context: ParseContext): string {
    if (args.length !== 1) {
        throw errorWithContext('##hint requires exactly one argument: hint', context);
    }

    context.idx++;
    return cleanArg(args.join(' '));
}

export function readReply(args: string[], context: ParseContext): string {
    if (args.length !== 1)
        throw errorWithContext('##start-reply requires exactly one argument: reply', context);
    context.idx++;
    return cleanArg(args.join(' '));
}

function errorWithContext(message: string, context: ParseContext): Error {
    return new Error(message + `. Line ${context.idx} in file ${context.filename}`);
}

export function readNeutral(args: string[], context: ParseContext): LevelBlock {
    if (args.length !== 1) {
        throw errorWithContext('##neutral requires exactly one argument: text', context);
    }

    context.idx++;
    const block: LevelBlock = {
        type: 'neutral',
        text: cleanArg(args[0])
    };

    return block;
}

export function readFilename(args: string[], context: ParseContext): string {
    if (args.length !== 1) {
        throw errorWithContext('##file must have exactly one argument', context);
    }

    context.idx++;
    return args[0];
}

function readMessage(context: ParseContext): string {
    const message: string[] = [];
    context.idx++;

    while (context.idx < context.lines.length && !context.lines[context.idx].trim().endsWith('"""')) {
        message.push(context.lines[context.idx].replace(/\r?\n$/, ''));
        context.idx++;
    }

    if (context.idx < context.lines.length) {
        context.idx++;
    }
    return message.join('\n').trim();
}

function getPrevBlock(context: ParseContext) {
    if (context.level.blocks.length === 0) {
        throw errorWithContext('previous block required!', context);
    }
    const prevBlockForExplain = context.level.blocks[context.level.blocks.length - 1];
    if (!["replace", "replace-span"].includes(prevBlockForExplain.type)) {
        throw errorWithContext(`previous block can't be ${prevBlockForExplain.type}`, context);
    }
    return prevBlockForExplain;
}

function readOneBlock(context: ParseContext) {
    const [cmd, args] = parseDirective(context);
    switch (cmd) {
        case '':
            context.level.blocks.push(readTextBlock(context));
            break;
        case 'file':
            context.level.filename = readFilename(args, context);
            break;
        case 'start':
            context.level.startMessage = readMessage(context);
            break;
        case 'final':
            context.level.finalMessage = readMessage(context);
            break;
        case 'start-reply':
            context.level.startReply = readReply(args, context);
            break;
        case 'final-reply':
            context.level.endReply = readReply(args, context);
            break;
        case 'wisdoms':
            context.level.wisdoms = readWisdoms(args, context);
            break;
        case 'replace-span':
            context.level.blocks.push(readReplaceSpan(args, context));
            break;
        case 'replace':
            context.level.blocks.push(readReplace(args, context));
            break;
        case 'replace-on':
            context.level.blocks.push(readReplaceOn(args, context));
            break;
        case 'add-on':
            context.level.blocks.push(readAddOn(args, context));
            break;
        case 'remove-on':
            context.level.blocks.push(readRemoveOn(args, context));
            break;
        case 'explain':
            getPrevBlock(context).explanation = readExplain(args, context);
            break;
        case 'hint':
            getPrevBlock(context).hint = readHint(args, context);
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
    resetIdGenerator();

    const outputLevel: LevelData = {
        filename: "",
        wisdoms: [],
        blocks: []
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


let idCounter: Record<string, number> = {}

function resetIdGenerator() {
    idCounter = {}
}

function generateId(clickable: string | undefined) {
    let id = makeIdFrom(clickable || "id");
    if (!idCounter[id]) {
        idCounter[id] = 0;
    } else {
        id = id + "-" + idCounter[id];
    }
    idCounter[id]++
    return id;

}

/** remove all nonId Characters. If end with an empty string, then return 'id'*/
function makeIdFrom(str: string) {
    str = str.replace(/[^a-zA-Z_0-9]+/g, '');
    if (str.length > 20) {
        str = str.substring(0, 20);
    }
    return str ? str : "id";

}
