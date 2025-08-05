import React, {useContext, useMemo, useRef} from 'react';
import {GameStateContext} from '../reducers';
import {closeOptionsMenu, codeClick, selectContextMenuItem} from '../reducers/actionCreators';
import {CodeView} from './CodeView';
import {BuddyChat} from './BuddyChat';
import {ContextMenu} from './ContextMenu';

/**
 * Level viewport container component
 */
export function LevelViewportContainer(): React.ReactElement {
    const context = useContext(GameStateContext);

    if (!context) {
        throw new Error('LevelViewportContainer must be used within a GameStateContext Provider');
    }

    const {state, dispatch} = context;

    const codeViewportRef = useRef<HTMLDivElement | null>(null);

    const handleCodeClick = (lineIndex: number, colIndex: number, token: string, clientX: number, clientY: number): void => {
        dispatch(codeClick(lineIndex, colIndex, token, clientX, clientY));
    };

    // Determine if the CodeView should be disabled
    const shouldDisableCodeView = useMemo(() => {
        // Case 1: Level is finished
        if (state.currentLevel?.isFinished) {
            return false; // Don't block editor when level is finished
        }

        // Case 2: New level instructions are shown and a reply is required
        if (state.chatMessages.length > 0) {
            const lastMessage = state.chatMessages[state.chatMessages.length - 1];
            if (lastMessage.type === 'buddy-instruct' && state.currentLevel?.level.startReply) {
                return true;
            }
        }

        return false;
    }, [state.currentLevel?.isFinished, state.chatMessages, state.currentLevel?.level.startReply]);

    if (!state.currentLevel) {
        return (
            <div className="flex-1 p-4 flex items-center justify-center">
                <p className="text-lg text-[#888888]">Select a level to begin</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto relative bg-[#1e1e1e]">
            <div className="flex border-b border-[#3c3c3c]">
                <div
                    className="px-4 py-2 bg-[#2d2d2d] border-r border-[#3c3c3c] rounded-t text-[#d4d4d4] flex items-center">
                    <span className="mr-2">{state.currentLevel.isFinished ? "✅" : "📄"}</span>
                    <span className="text-[#9cdcfe] font-medium">{state.currentLevel.level.filename}</span>

                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                <div className="code-viewport flex-1 overflow-hidden relative" ref={codeViewportRef}>
                    <CodeView
                        key={state.currentLevelId.topic + "/" + state.currentLevelId.levelId}
                        code={state.currentLevel.code}
                        animate={true}
                        disable={shouldDisableCodeView}
                        isFinished={state.currentLevel.isFinished}
                        onClick={handleCodeClick}
                    />
                    {state.optionsMenu?.visible && state.optionsMenu.options && (
                        <ContextMenu
                            options={state.optionsMenu.options}
                            position={
                                (() => {
                                    const a = state.optionsMenu?.anchor;
                                    const el = codeViewportRef.current;
                                    if (a && el) {
                                        const rect = el.getBoundingClientRect();
                                        return {x: a.x - rect.left, y: a.y - rect.top};
                                    }
                                    return undefined;
                                })()
                            }
                            onSelect={(id) => dispatch(selectContextMenuItem(id))}
                            onClose={() => dispatch(closeOptionsMenu())}
                        />
                    )}
                </div>
                <BuddyChat/>
            </div>
        </div>
    );
}
