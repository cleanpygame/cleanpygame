import {describe, test, expect} from 'vitest';
import {applyEvents} from '../utils/pylang';
import {EventRegion} from '../utils/regions';
import {topics} from '../data/levels.json';
import {LevelBlock} from '../types';

function createTextBlock(text: string): LevelBlock {
    return {type: 'text', text: text + "\n"};
}

function createReplaceSpanBlock(clickable: string, replacement: string, event: string): LevelBlock {
    return {
        type: 'replace-span', clickable, replacement, event
    };
}

function createReplaceBlock(text: string, replacement: string, event: string, clickable: string | undefined = undefined): LevelBlock {
    return {
        type: 'replace', text: text + "\n", replacement: replacement + "\n", event, clickable
    };
}

function createReplaceOnBlock(text: string, replacement: string, event: string): LevelBlock {
    return {
        type: 'replace-on', text: text + "\n", replacement: replacement + "\n", event
    };
}

describe('applyEvents', () => {
    test('should render text blocks correctly', () => {
        const blocks = [createTextBlock('line 1\nline 2')];

        const result = applyEvents(blocks, []);

        expect(result.code).toBe('line 1\nline 2');
        expect(result.regions).toEqual([]);
    });

    test('should handle replace-span without triggered event', () => {
        const blocks = [createTextBlock('function badName() {'), createReplaceSpanBlock('badName', 'goodName', 'rename-func')];

        const result = applyEvents(blocks, []);

        expect(result.code).toBe('function badName() {');
        expect(result.regions).toEqual([new EventRegion(0, 9, 0, 16, 'rename-func')]);
    });

    test('should handle replace-span with triggered event', () => {
        const blocks = [createTextBlock('function badName() {'), createReplaceSpanBlock('badName', 'goodName', 'rename-func')];

        const result = applyEvents(blocks, ['rename-func']);

        expect(result.code).toBe('function goodName() {');
        expect(result.regions).toEqual([]);
    });

    test('should handle replace block without triggered event', () => {
        const blocks = [createReplaceBlock('def bad_function():\n    print("bad")', 'def good_function():\n    print("good")', 'rename-func')];

        const result = applyEvents(blocks, []);

        expect(result.code).toBe('def bad_function():\n    print("bad")');
        expect(result.regions.length).toBe(1);
        expect(result.regions[0].eventId).toBe('rename-func');
    });

    test('should handle replace block with triggered event', () => {
        const blocks = [createReplaceBlock('def bad_function():\n    print("bad")', 'def good_function():\n    print("good")', 'rename-func')];

        const result = applyEvents(blocks, ['rename-func']);

        expect(result.code).toBe('def good_function():\n    print("good")');
        expect(result.regions).toEqual([]);
    });

    test('should handle remove block with triggered event', () => {
        const blocks = [createReplaceBlock('def bad_function():\n    print("bad")', '', 'rename-func')];

        const result = applyEvents(blocks, ['rename-func']);

        expect(result.code).toBe('');
        expect(result.regions).toEqual([]);
    });

    test('should handle replace-on block when event not triggered', () => {
        const blocks = [createReplaceBlock('bad_function()', 'good_function()', 'rename-func'), createReplaceOnBlock('result = bad_function()', 'result = good_function()', 'rename-func')];

        const result = applyEvents(blocks, []);

        expect(result.code).toBe('bad_function()\nresult = bad_function()');
        expect(result.regions.length).toBe(1);
    });

    test('should handle replace-on block when event is triggered', () => {
        const blocks = [createReplaceBlock('bad_function()', 'good_function()', 'rename-func'), createReplaceOnBlock('result = bad_function()', 'result = good_function()', 'rename-func')];

        const result = applyEvents(blocks, ['rename-func']);

        expect(result.code).toBe('good_function()\nresult = good_function()');
        expect(result.regions).toEqual([]);
    });

    test('should handle complex scenario with multiple events', () => {
        const blocks = [
            createTextBlock('# Example code'),
            createReplaceBlock('def getData():\n    return "data"', 'def get_user_data():\n    # return data\n    return "data"', 'rename-func1'),
            createTextBlock("print(getData())"),
            createReplaceSpanBlock('getData', 'get_user_data', 'rename-func2'),
            createReplaceOnBlock('result = getData()', 'result = get_user_data()', 'rename-func1'),
            createReplaceOnBlock('if getData():', 'if get_user_data():', 'rename-func2')
        ];

        // Test with no events triggered
        let result = applyEvents(blocks, []);
        expect(result.code).toBe('# Example code\n' + 'def getData():\n    return "data"\n' + 'print(getData())\n' + 'result = getData()\n' + 'if getData():');
        expect(result.regions.length).toBe(5);

        // Test with first event triggered
        result = applyEvents(blocks, ['rename-func1']);
        expect(result.code).toBe('# Example code\n' + 'def get_user_data():\n    # return data\n    return "data"\n' + 'print(getData())\n' + 'result = get_user_data()\n' + 'if getData():');
        expect(result.regions.length).toBe(2);

        // Test with both events triggered
        result = applyEvents(blocks, ['rename-func1', 'rename-func2']);
        expect(result.code).toBe('# Example code\n' + 'def get_user_data():\n    # return data\n    return "data"\n' + 'print(get_user_data())\n' + 'result = get_user_data()\n' + 'if get_user_data():');
        expect(result.regions.length).toBe(0);

        // Test with both events triggered
        result = applyEvents(blocks, ['rename-func2']);
        expect(result.code).toBe('# Example code\n' + 'def get_user_data():\n    return "data"\n' + 'print(get_user_data())\n' + 'result = get_user_data()\n' + 'if get_user_data():');
        expect(result.regions.length).toBe(1);

        // Test with both events triggered
        result = applyEvents(blocks, ['rename-func2', 'rename-func1']);
        expect(result.code).toBe('# Example code\n' + 'def get_user_data():\n    # return data\n    return "data"\n' + 'print(get_user_data())\n' + 'result = get_user_data()\n' + 'if get_user_data():');
        expect(result.regions.length).toBe(0);
    });

    test('should handle clickable substring in replace block', () => {
        const blocks = [createReplaceBlock('def bad_name():\n    return "value"', 'def good_name():\n    return "value"', 'rename-func', 'bad_name')];

        const result = applyEvents(blocks, []);

        expect(result.code).toBe('def bad_name():\n    return "value"');
        expect(result.regions.length).toBe(1);
        expect(result.regions[0].startLine).toBe(0);
        expect(result.regions[0].startCol).toBe(4);
        expect(result.regions[0].endLine).toBe(0);
        expect(result.regions[0].endCol).toBe(12);
    });

    test('should find all regions in test level', () => {
        const blocks = topics[0].levels[0].blocks as LevelBlock[];

        const result = applyEvents(blocks, []);
        const expected = [
            {startLine: 4, startCol: 4, endLine: 4, endCol: 7, eventId: '<generated>'},
            {startLine: 5, startCol: 17, endLine: 5, endCol: 20, eventId: '<generated>'},
            {startLine: 7, startCol: 0, endLine: 8, endCol: 100500, eventId: 'BAD_CODE'},
            {startLine: 0, startCol: 4, endLine: 0, endCol: 7, eventId: '<generated>'},
            {startLine: 1, startCol: 10, endLine: 1, endCol: 12, eventId: 'e42'}
        ];

        expect(result.code).toBe(
            `def foo():
    print(42)


def bar():
    print("Hello bar!")

def BAD_CODE():
    print("BAD")

`);

        expect(result.regions.length).toBe(expected.length);
        expected.forEach((expected) => {
            const found = result.regions.some(actual =>
                expected.startLine === actual.startLine &&
                expected.endLine === actual.endLine &&
                expected.startCol === actual.startCol &&
                expected.endCol === actual.endCol
            );
            expect(found, `Expected region not found: ${JSON.stringify(expected)}`).toBeTruthy();
        });
    });
});