import {assert, describe, expect, test} from 'vitest';
import {renderToPyLevel} from '../utils/pylang';
import {LevelData} from '../types';
import {parseLevelText} from '../levels_compiler/parser';

// Real level content from the web/levels folder
const TEST_LEVEL = `##file onboarding.py
"""start
This is a test level
"""
def foo():
    print(42)

##replace - bar
def bar():
    print("Hello bar!")
##with
def greet_user():
    print("Hello")
##end
##explain "No Foos!"

##replace BAD_CODE
def BAD_CODE():
    print("BAD")
##with
##end
##explain "Do not write bad code!"

##add-on BAD_CODE
def GOOD_CODE():
    print("ABSOLUTELY GOOD CODE!")
##end
##replace-span - foo "nonfoo"
##hint "Look at foo!"
##explain "no foos"

##replace-span e42 "42" "the_answer"
##hint "42 = 6 * 8"
##explain "no magic constants!"
"""final
Congratulations! You've completed the test level.
"""
`;

// Utility function to parse level content into LevelData
function parseLevelContent(content: string): LevelData {
    const result = parseLevelText(content);
    if (result.error || !result.level) {
        throw new Error(`Failed to parse level content: ${result.error}`);
    }
    return result.level;
}

describe('renderToPyLevel basic tests', () => {
    test('should render a complete level with all required fields', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'text',
                    text: '# This is a test\n'
                }
            ],
            startMessage: 'Welcome to the level!',
            startReply: 'Let\'s begin',
            finalMessage: 'Great job!',
            endReply: 'Finish'
        };

        const result = renderToPyLevel(level);

        // Check that the result contains all the required elements
        expect(result).toContain('##file test.py');
        expect(result).toContain('"""start\nWelcome to the level!\n"""');
        expect(result).toContain('##start-reply "Let\'s begin"');
        expect(result).toContain('# This is a test');
        expect(result).toContain('"""final\nGreat job!\n"""');
        expect(result).toContain('##final-reply "Finish"');
    });

    test('should render a level with missing optional fields', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'text',
                    text: '# This is a test\n'
                }
            ],
            startMessage: 'Welcome to the level!',
            finalMessage: 'Great job!'
        };

        const result = renderToPyLevel(level);

        // Check that the result contains the required elements but not the optional ones
        expect(result).toContain('##file test.py');
        expect(result).toContain('"""start\nWelcome to the level!\n"""');
        expect(result).not.toContain('##start-reply');
        expect(result).toContain('# This is a test');
        expect(result).toContain('"""final\nGreat job!\n"""');
        expect(result).not.toContain('##final-reply');
    });
});

describe('renderToPyLevel block type tests', () => {
    test('should render text blocks correctly', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'text',
                    text: '# This is a text block\n'
                },
                {
                    type: 'text',
                    text: 'def function():\n    pass\n'
                }
            ],
            startMessage: 'Start',
            finalMessage: 'Final'
        };

        const result = renderToPyLevel(level);

        expect(result).toContain('# This is a text block\n');
        expect(result).toContain('def function():\n    pass\n');
    });

    test('should render replace-span blocks correctly', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'replace-span',
                    event: 'event1',
                    clickable: 'old_name',
                    replacement: 'new_name'
                }
            ],
            startMessage: 'Start',
            finalMessage: 'Final'
        };

        const result = renderToPyLevel(level);

        expect(result).toContain('##replace-span - old_name new_name');
    });

    test('should render replace-span blocks with hint and explanation', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'replace-span',
                    event: 'event1',
                    clickable: 'old_name',
                    replacement: 'new_name',
                    hint: 'This is a hint',
                    explanation: 'This is an explanation'
                }
            ],
            startMessage: 'Start',
            finalMessage: 'Final'
        };

        const result = renderToPyLevel(level);

        expect(result).toContain('##replace-span - old_name new_name');
        expect(result).toContain('##hint "This is a hint"');
        expect(result).toContain('##explain "This is an explanation"');
    });

    test('should render replace blocks correctly', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'replace',
                    event: 'event1',
                    text: 'def old_function():\n    pass\n',
                    replacement: 'def new_function():\n    pass\n'
                }
            ],
            startMessage: 'Start',
            finalMessage: 'Final'
        };

        const result = renderToPyLevel(level);

        expect(result).toContain('##replace');
        expect(result).toContain('def old_function():\n    pass');
        expect(result).toContain('##with');
        expect(result).toContain('def new_function():\n    pass');
        expect(result).toContain('##end');
    });

    test('should render replace blocks with clickable substring', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'replace',
                    event: 'event1',
                    clickable: 'old_function',
                    text: 'def old_function():\n    pass\n',
                    replacement: 'def new_function():\n    pass\n'
                }
            ],
            startMessage: 'Start',
            finalMessage: 'Final'
        };

        const result = renderToPyLevel(level);

        expect(result).toContain('##replace - old_function');
        expect(result).toContain('def old_function():\n    pass');
        expect(result).toContain('##with');
        expect(result).toContain('def new_function():\n    pass');
        expect(result).toContain('##end');
    });

    test('should render replace blocks with hint and explanation', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'replace',
                    event: 'event1',
                    text: 'def old_function():\n    pass\n',
                    replacement: 'def new_function():\n    pass\n',
                    hint: 'This is a hint',
                    explanation: 'This is an explanation'
                }
            ],
            startMessage: 'Start',
            finalMessage: 'Final'
        };

        const result = renderToPyLevel(level);

        expect(result).toContain('##replace');
        expect(result).toContain('def old_function():\n    pass');
        expect(result).toContain('##with');
        expect(result).toContain('def new_function():\n    pass');
        expect(result).toContain('##end');
        expect(result).toContain('##hint "This is a hint"');
        expect(result).toContain('##explain "This is an explanation"');
    });

    test('should render replace-on blocks correctly', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'replace-on',
                    event: 'event1',
                    text: 'print("old")\n',
                    replacement: 'print("new")\n'
                }
            ],
            startMessage: 'Start',
            finalMessage: 'Final'
        };

        const result = renderToPyLevel(level);

        expect(result).toContain('##replace-on event1');
        expect(result).toContain('print("old")');
        expect(result).toContain('##with');
        expect(result).toContain('print("new")');
        expect(result).toContain('##end');
    });

    test('should render replace-on blocks with multiple events', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'replace-on',
                    event: ['event1', 'event2'],
                    text: 'print("old")\n',
                    replacement: 'print("new")\n'
                }
            ],
            startMessage: 'Start',
            finalMessage: 'Final'
        };

        const result = renderToPyLevel(level);

        expect(result).toContain('##replace-on event1 event2');
        expect(result).toContain('print("old")');
        expect(result).toContain('##with');
        expect(result).toContain('print("new")');
        expect(result).toContain('##end');
    });

    test('should render add-on blocks correctly', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'replace-on',
                    event: 'event1',
                    text: '',
                    replacement: 'print("new")\n'
                }
            ],
            startMessage: 'Start',
            finalMessage: 'Final'
        };

        const result = renderToPyLevel(level);

        expect(result).toContain('##add-on event1');
        expect(result).toContain('print("new")');
        expect(result).toContain('##end');
        expect(result).not.toContain('##with');
    });

    test('should render remove-on blocks correctly', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'replace-on',
                    event: 'event1',
                    text: 'print("old")\n',
                    replacement: ''
                }
            ],
            startMessage: 'Start',
            finalMessage: 'Final'
        };

        const result = renderToPyLevel(level);

        expect(result).toContain('##remove-on event1');
        expect(result).toContain('print("old")');
        expect(result).toContain('##end');
        expect(result).not.toContain('##with');
    });
});

describe('renderToPyLevel edge cases', () => {
    test('should handle text blocks without newlines', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'text',
                    text: '# This is a text block without newline'
                }
            ],
            startMessage: 'Start',
            finalMessage: 'Final'
        };

        const result = renderToPyLevel(level);

        expect(result).toContain('# This is a text block without newline\n');
    });

    test('should handle empty blocks array', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [],
            startMessage: 'Start',
            finalMessage: 'Final'
        };

        const result = renderToPyLevel(level);

        expect(result).toContain('##file test.py');
        expect(result).toContain('"""start\nStart\n"""');
        expect(result).toContain('"""final\nFinal\n"""');
    });

    test('should handle blocks with missing fields', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'replace',
                    event: 'event1',
                    // Missing text and replacement
                }
            ],
            startMessage: 'Start',
            finalMessage: 'Final'
        };

        const result = renderToPyLevel(level);

        expect(result).toContain('##replace');
        expect(result).toContain('##with');
        expect(result).toContain('##end');
    });

    test('should handle blocks with undefined fields', () => {
        const level: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'replace-span',
                    event: 'event1',
                    clickable: undefined,
                    replacement: undefined
                }
            ],
            startMessage: 'Start',
            finalMessage: 'Final'
        };

        // This should not throw an error
        const result = renderToPyLevel(level);

        // The block should be skipped or rendered with empty values
        expect(result).not.toContain('##replace-span event1');
    });
});

describe('renderToPyLevel round-trip tests', () => {
    test('should produce output that can be parsed back to the original level', () => {
        const originalLevel: LevelData = {
            filename: 'test.py',
            blocks: [
                {
                    type: 'text',
                    text: '# This is a test\n'
                },
                {
                    type: 'replace-span',
                    event: 'event1',
                    clickable: 'old_name',
                    replacement: 'new_name',
                    hint: 'This is a hint',
                    explanation: 'This is an explanation'
                },
                {
                    type: 'replace',
                    event: 'id',
                    text: 'def old_function():\n    pass\n',
                    replacement: 'def new_function():\n    pass\n',
                    hint: 'Another hint',
                    explanation: 'Another explanation'
                },
                {
                    type: 'replace-on',
                    event: 'event1',
                    text: 'print("old")\n',
                    replacement: 'print("new")\n'
                }
            ],
            startMessage: 'Welcome to the level!',
            startReply: 'Let\'s begin',
            finalMessage: 'Great job!',
            endReply: 'Finish'
        };

        const rendered = renderToPyLevel(originalLevel);

        // Parse the rendered text back to a level
        const parseResult = parseLevelText(rendered);
        expect(parseResult.level).toEqual(originalLevel);


    });
});

function compareLinePrefixes(actual: string, expected: string, linePrefixLen: number) {
    const actualLines = actual.split('\n');
    const expectedLines = expected.split('\n');
    for (let i = 0; i < Math.min(actualLines.length, expectedLines.length); i++) {
        console.log("Actual  : " + actualLines[i]);
        console.log("Expected: " + expectedLines[i]);
        expect(actualLines[i].substring(0, linePrefixLen)).toBe(expectedLines[i].substring(0, linePrefixLen));
    }
    if (actualLines.length !== expectedLines.length) {
        assert.fail(`Different number of lines: ${actualLines.length} vs ${expectedLines.length}`);
    }
}

describe('renderToPyLevel with real level content', () => {
    test('should correctly render and parse the test level', () => {
        // Parse the test level content
        const level = parseLevelContent(TEST_LEVEL);

        // Render the level back to PyLevels format
        const rendered = renderToPyLevel(level);
        console.log(rendered);
        compareLinePrefixes(rendered, TEST_LEVEL, 5);
    });
});