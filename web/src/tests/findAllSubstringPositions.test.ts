import {describe, expect, test} from 'vitest';
import {findAllSubstringPositions} from '../utils/pylang';

describe('findAllSubstringPositions', () => {
    test('should find substrings with word boundaries', () => {
        const text = 'This is a test. The word test appears twice.';
        const substring = 'test';

        const result = findAllSubstringPositions(text, substring);

        expect(result.length).toBe(2);
        expect(result[0].startColumn).toBe(10);
        expect(result[1].startColumn).toBe(25);
    });

    test('should not find substrings without word boundaries', () => {
        const text = 'Testing is important. A tester tests software.';
        const substring = 'test';

        const result = findAllSubstringPositions(text, substring);

        // Should only find "test" in "tests", not in "Testing" or "tester"
        expect(result.length).toBe(0);
    });

    test('should handle multiline text', () => {
        const text = 'First line with test.\nSecond line with test.\nThird line with testing.';
        const substring = 'test';

        const result = findAllSubstringPositions(text, substring);

        expect(result.length).toBe(2);
        expect(result[0].startLine).toBe(0);
        expect(result[1].startLine).toBe(1);
    });

    test('should handle empty inputs', () => {
        expect(findAllSubstringPositions('', 'test')).toEqual([]);
        expect(findAllSubstringPositions('text', '')).toEqual([]);
        expect(findAllSubstringPositions('', '')).toEqual([]);
    });
});
