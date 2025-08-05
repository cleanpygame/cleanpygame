import {describe, expect, test} from 'vitest';
import {gameReducer, initialState} from '../reducers';
import {codeClick, selectContextMenuItem} from '../reducers/actionCreators';
import {EventRegion} from '../utils/regions';
import {GameState} from '../types';

describe('Context menu guarded click handling', () => {
    test('CODE_CLICK opens options menu when block has options', () => {
        const evt = 'evt1';
        let state: GameState = {
            ...initialState,
            currentLevel: {
                ...initialState.currentLevel,
                level: {
                    ...initialState.currentLevel.level,
                    blocks: [
                        {
                            type: 'replace',
                            text: 'print("old")\n',
                            replacement: 'print("new")\n',
                            event: evt,
                            options: [
                                {id: 'o1', label: 'Opt 1', correct: false},
                                {id: 'o2', label: 'Opt 2', correct: true}
                            ]
                        }
                    ]
                },
                regions: [new EventRegion(0, 0, 0, 10, evt)],
                code: 'print("old")\n'
            }
        };

        // Click in region
        state = gameReducer(state, codeClick(0, 0, 'print'));

        expect(state.optionsMenu?.visible).toBe(true);
        expect(state.optionsMenu?.event).toBe(evt);
        expect(state.currentLevel.triggeredEvents.includes(evt)).toBe(false);
    });

    test('SELECT_CONTEXT_MENUITEM incorrect posts buddy message and closes', () => {
        const evt = 'evt2';
        let state: GameState = {
            ...initialState,
            optionsMenu: {visible: true, event: evt, options: [{id: 'bad', label: 'Bad', correct: false}]}
        } as any;

        state = gameReducer(state, selectContextMenuItem('bad'));

        expect(state.optionsMenu?.visible).toBe(false);
        expect(state.chatMessages.length).toBeGreaterThan(0);
        const last = state.chatMessages[state.chatMessages.length - 1];
        expect(last.type).toBe('buddy-reject');
    });

    test('SELECT_CONTEXT_MENUITEM correct applies fix and closes', () => {
        const evt = 'evt3';
        let state: GameState = {
            ...initialState,
            currentLevel: {
                ...initialState.currentLevel,
                level: {
                    ...initialState.currentLevel.level,
                    blocks: [
                        {type: 'replace', text: 'x=1\n', replacement: 'x=2\n', event: evt}
                    ]
                }
            },
            optionsMenu: {visible: true, event: evt, options: [{id: 'ok', label: 'Ok', correct: true}]}
        } as any;

        state = gameReducer(state, selectContextMenuItem('ok'));

        expect(state.optionsMenu?.visible).toBe(false);
        expect(state.currentLevel.triggeredEvents.includes(evt)).toBe(true);
    });
});
