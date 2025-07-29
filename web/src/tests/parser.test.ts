import {describe, expect, test} from 'vitest';
import {parseLevelText} from '../levels_compiler/parser';

describe('parseLevelText required instructions tests', () => {
    test('should parse a complete level with all required instructions', () => {
        const content = `##file test.py
"""start
Welcome to the level!
"""
##start-reply "Let's begin"

# Code here

"""final
Great job!
"""
##final-reply "Finish"`;
        const result = parseLevelText(content);

        expect(result.error).toBeUndefined();
        expect(result.level).toBeDefined();
        expect(result.level?.filename).toBe('test.py');
        expect(result.level?.startMessage).toBeDefined();
        expect(result.level?.startReply).toBeDefined();
        expect(result.level?.finalMessage).toBeDefined();
        expect(result.level?.endReply).toBeDefined();
    });

    test('should return error for missing file instruction', () => {
        const content = `"""start
Welcome to the level!
"""
##start-reply "Let's begin"

# Code here

"""final
Great job!
"""
##final-reply "Finish"`;
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Missing required level instructions: file');
    });

    test('should return error for missing start instruction', () => {
        const content = `##file test.py
##start-reply "Let's begin"

# Code here

"""final
Great job!
"""
##final-reply "Finish"`;
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Missing required level instructions: start');
    });

    test('should return error for missing start-reply instruction', () => {
        const content = `##file test.py
"""start
Welcome to the level!
"""

# Code here

"""final
Great job!
"""
##final-reply "Finish"`;
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Missing required level instructions: start-reply');
    });

    test('should return error for missing final instruction', () => {
        const content = `##file test.py
"""start
Welcome to the level!
"""
##start-reply "Let's begin"

# Code here

##final-reply "Finish"`;
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Missing required level instructions: final');
    });

    test('should return error for missing final-reply instruction', () => {
        const content = `##file test.py
"""start
Welcome to the level!
"""
##start-reply "Let's begin"

# Code here

"""final
Great job!
"""`;
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Missing required level instructions: final-reply');
    });

    test('should return error for multiple missing instructions', () => {
        const content = `##file test.py

# Code here

"""final
Great job!
"""`;
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Missing required level instructions: start, start-reply, final-reply');
    });
});

describe('parseLevelText negative tests', () => {
    test('should return error for incomplete instruction', () => {
        const content = '## f';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Failed to parse directive:');
    });


    test('should return error for incorrect file directive format', () => {
        const content = '##  file test.py';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Failed to parse directive: ##  file');
    });

    test('should return error for file directive with no arguments', () => {
        const content = '##file';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('##file must have exactly one argument');
    });

    test('should return error for file directive with too many arguments', () => {
        const content = '##file test.py extra.py';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('##file must have exactly one argument');
    });

    test('should return error for unknown directive', () => {
        const content = '##file test.py\n##unknown directive';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Unknown ##unknown');
    });

    test('should return error for replace directive with missing ##with', () => {
        const content = '##file test.py\n##replace\nsome code\n##end';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Missing ##with directive');
    });

    test('should return error for replace directive with missing ##end', () => {
        const content = '##file test.py\n##replace\nsome code\n##with\nreplacement code';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Missing ##end directive');
    });

    test('should return error for replace-span with incorrect number of arguments', () => {
        const content = '##file test.py\n##replace-span event clickable';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('##replace-span requires 3 arguments');
    });

    test('should return error for explain without previous block', () => {
        const content = '##file test.py\n##explain "This is an explanation"';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('previous block required');
    });

    test('should return error for hint without previous block', () => {
        const content = '##file test.py\n##hint "This is a hint"';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('previous block required');
    });

    test('should return error for explain after non-replaceable block', () => {
        const content = '##file test.py\nSome text\n##explain "This is an explanation"';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('previous block can\'t be');
    });

    test('should return error for start-reply with no arguments', () => {
        const content = '##file test.py\n##start-reply';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('requires exactly one argument');
    });

    test('should return error for final-reply with no arguments', () => {
        const content = '##file test.py\n##final-reply';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('requires exactly one argument');
    });

    test('should return error for replace-on with incorrect number of arguments', () => {
        const content = '##file test.py\n##replace-on';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('##replace-on requires exactly one argument');
    });

    test('should return error for add-on with incorrect number of arguments', () => {
        const content = '##file test.py\n##add-on';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('##add-on requires exactly one argument');
    });

    test('should return error for remove-on with incorrect number of arguments', () => {
        const content = '##file test.py\n##remove-on';
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('##remove-on requires exactly one argument');
    });

    test('should treat single # as plain text but fail validation for missing required instructions', () => {
        const content = '##file test.py\n# This is a comment';
        const result = parseLevelText(content);

        // The # is treated as plain text, but the level fails validation for missing required instructions
        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Missing required level instructions');
    });
});

describe('parseLevelText event reference validation tests', () => {
    // Base level content with all required instructions
    const baseLevel = `##file test.py
"""start
Welcome to the level!
"""
##start-reply "Let's begin"

# Code here

"""final
Great job!
"""
##final-reply "Finish"`;

    test('should parse a level with valid event references', () => {
        const content = `${baseLevel}

##replace event1 "clickable"
def function():
    pass
##with
def better_function():
    pass
##end

##replace-on event1
print("old")
##with
print("new")
##end
`;
        const result = parseLevelText(content);

        expect(result.error).toBeUndefined();
        expect(result.level).toBeDefined();
    });

    test('should return error for undefined event in replace-on block', () => {
        const content = `${baseLevel}

##replace-on undefined_event
print("old")
##with
print("new")
##end
`;
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Events referenced but not defined');
        expect(result.error).toContain('undefined_event');
        expect(result.error).toContain('replace-on');
    });

    test('should return error for undefined event in add-on block', () => {
        const content = `${baseLevel}

##add-on undefined_event
print("new code")
##end
`;
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Events referenced but not defined');
        expect(result.error).toContain('undefined_event');
        expect(result.error).toContain('add-on');
    });

    test('should return error for undefined event in remove-on block', () => {
        const content = `${baseLevel}

##remove-on undefined_event
print("code to remove")
##end
`;
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Events referenced but not defined');
        expect(result.error).toContain('undefined_event');
        expect(result.error).toContain('remove-on');
    });

    test('should return error for multiple undefined events', () => {
        const content = `${baseLevel}

##replace-on event1
print("old1")
##with
print("new1")
##end

##add-on event2
print("new code")
##end

##remove-on event3
print("code to remove")
##end
`;
        const result = parseLevelText(content);

        expect(result.error).toBeDefined();
        expect(result.level).toBeUndefined();
        expect(result.error).toContain('Events referenced but not defined');
        expect(result.error).toContain('event1');
        expect(result.error).toContain('event2');
        expect(result.error).toContain('event3');
    });

    test('should allow multiple references to the same defined event', () => {
        const content = `${baseLevel}

##replace event1 "clickable"
def function():
    pass
##with
def better_function():
    pass
##end

##replace-on event1
print("old1")
##with
print("new1")
##end

##add-on event1
print("additional code")
##end

##remove-on event1
print("code to remove")
##end
`;
        const result = parseLevelText(content);

        expect(result.error).toBeUndefined();
        expect(result.level).toBeDefined();
    });

    test('should allow events defined in replace-span blocks', () => {
        const content = `${baseLevel}

##replace-span event1 "clickable" "replacement"

##replace-on event1
print("old")
##with
print("new")
##end
`;
        const result = parseLevelText(content);

        expect(result.error).toBeUndefined();
        expect(result.level).toBeDefined();
    });
});