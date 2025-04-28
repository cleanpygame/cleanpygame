import {describe, expect, test} from 'vitest';
import {replaceAll} from '../utils/pylang';
import {LevelBlock} from '../types';

describe('replaceAll', () => {
    test('should replace substrings with word boundaries', () => {
        const text = 'This is a test. The word test appears twice.';
        const spanReplacementBlocks: LevelBlock[] = [
            {
                type: 'replace-span',
                clickable: 'test',
                replacement: 'example',
                event: 'test-event'
            }
        ];

        const result = replaceAll(text, spanReplacementBlocks);

        expect(result).toBe('This is a example. The word example appears twice.');
    });

    test('should not replace substrings without word boundaries', () => {
        const text = 'Testing is important. A tester tests software.';
        const spanReplacementBlocks: LevelBlock[] = [
            {
                type: 'replace-span',
                clickable: 'test',
                replacement: 'example',
                event: 'test-event'
            }
        ];

        const result = replaceAll(text, spanReplacementBlocks);

        // Should not replace "test" in "Testing" or "tester"
        expect(result).toBe('Testing is important. A tester tests software.');
    });

    test('should handle multiple replacements', () => {
        const text = 'This is a test. The word foo appears once.';
        const spanReplacementBlocks: LevelBlock[] = [
            {
                type: 'replace-span',
                clickable: 'test',
                replacement: 'example',
                event: 'test-event'
            },
            {
                type: 'replace-span',
                clickable: 'foo',
                replacement: 'bar',
                event: 'foo-event'
            }
        ];

        const result = replaceAll(text, spanReplacementBlocks);

        expect(result).toBe('This is a example. The word bar appears once.');
    });

    test('should handle empty inputs', () => {
        expect(replaceAll('', [])).toBe('');

        const spanReplacementBlocks: LevelBlock[] = [
            {
                type: 'replace-span',
                clickable: 'test',
                replacement: 'example',
                event: 'test-event'
            }
        ];
        expect(replaceAll('', spanReplacementBlocks)).toBe('');
    });

    test('should handle blocks without clickable or replacement', () => {
        const text = 'This is a test.';
        const spanReplacementBlocks: LevelBlock[] = [
            {
                type: 'replace-span',
                event: 'test-event'
            }
        ];

        const result = replaceAll(text, spanReplacementBlocks);

        expect(result).toBe('This is a test.');
    });
});