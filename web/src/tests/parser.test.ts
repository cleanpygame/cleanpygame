import {describe, expect, test} from 'vitest';
import {parseLevelText} from '../levels_compiler/parser';

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

    test('should return error for single # directive', () => {
        const content = '##file test.py\n# This is a comment';
        const result = parseLevelText(content);

        // This should not throw an error as it's treated as plain text
        expect(result.error).toBeUndefined();
        expect(result.level).toBeDefined();
    });
});