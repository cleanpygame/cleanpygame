import {describe, expect, test} from 'vitest';
import {replaceSubstringWithWordBoundaries} from '../utils/pylang';

describe('replaceSubstringWithWordBoundaries', () => {
    test('should replace substrings with word boundaries', () => {
        const text = 'This is a test. The word test appears twice.';
        const substring = 'test';
        const replacement = 'example';

        const result = replaceSubstringWithWordBoundaries(text, substring, replacement);

        expect(result).toBe('This is a example. The word example appears twice.');
    });

    test('should not replace substrings without word boundaries', () => {
        const text = 'Testing is important. A tester tests software.';
        const substring = 'test';
        const replacement = 'example';

        const result = replaceSubstringWithWordBoundaries(text, substring, replacement);

        // Should not replace "test" in "Testing" or "tester"
        expect(result).toBe('Testing is important. A tester tests software.');
    });

    test('should handle multiline text', () => {
        const text = 'First line with test.\nSecond line with test.\nThird line with testing.';
        const substring = 'test';
        const replacement = 'example';

        const result = replaceSubstringWithWordBoundaries(text, substring, replacement);

        expect(result).toBe('First line with example.\nSecond line with example.\nThird line with testing.');
    });

    test('should handle empty inputs', () => {
        expect(replaceSubstringWithWordBoundaries('', 'test', 'example')).toBe('');
        expect(replaceSubstringWithWordBoundaries('text', '', 'example')).toBe('text');
    });

    test('should handle special characters', () => {
        const text = 'This is a test! And another test? Yes, test.';
        const substring = 'test';
        const replacement = 'example';

        const result = replaceSubstringWithWordBoundaries(text, substring, replacement);

        expect(result).toBe('This is a example! And another example? Yes, example.');
    });
});