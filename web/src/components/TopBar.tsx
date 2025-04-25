import React, {useContext} from 'react';
import {GameStateContext} from '../reducer';

/**
 * Top navigation bar component
 * Dispatches actions: TOGGLE_NOTEBOOK, RESET_PROGRESS, GET_HINT
 */
export function TopBar(): React.ReactElement {
    const context = useContext(GameStateContext);

    if (!context) {
        throw new Error('TopBar must be used within a GameStateContext Provider');
    }

    const {dispatch} = context;

    return (
        <div className="flex items-center justify-between h-12 px-4 bg-[#252526] border-b border-[#3c3c3c]">
            <div className="text-lg font-medium">Clean Code Game</div>

            <div className="flex gap-4">
                <button
                    onClick={() => dispatch({type: 'GET_HINT'})}
                    className="px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors"
                    title="Ask for Help"
                >
                    <span role="img" aria-label="help">🙏</span>
                    <span>Ask for Help</span>
                </button>

                <button
                    onClick={() => dispatch({type: 'TOGGLE_NOTEBOOK'})}
                    className="px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors"
                    title="Toggle Notebook"
                >
                    <span role="img" aria-label="notebook">📒</span>
                    <span>Notebook</span>
                </button>

                <button
                    onClick={() => dispatch({type: 'RESET_PROGRESS'})}
                    className="px-3 py-1 flex items-center gap-2 rounded hover:bg-[#3c3c3c] transition-colors"
                    title="Reset Progress"
                >
                    <span role="img" aria-label="reset">🔄</span>
                    <span>Reset Progress</span>
                </button>
            </div>
        </div>
    );
}