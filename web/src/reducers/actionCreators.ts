import {
  APPLY_FIX,
  CODE_CLICK,
  GET_HINT,
  LOAD_LEVEL,
  NEXT_LEVEL,
  POST_CHAT_MESSAGE,
  RESET_PROGRESS,
  SET_TYPING_ANIMATION_COMPLETE,
  TOGGLE_NOTEBOOK,
  WRONG_CLICK
} from './actionTypes';
import {ChatMessage, LevelId} from '../types';

// Action interfaces
export interface LoadLevelAction {
    type: typeof LOAD_LEVEL;
    payload: {
        levelId: LevelId;
    };
}

export interface ApplyFixAction {
    type: typeof APPLY_FIX;
    payload: {
        eventId: string;
    };
}

export interface WrongClickAction {
    type: typeof WRONG_CLICK;
    payload: {
        lineIndex: number;
        colIndex: number;
        token: string;
    };
}

export interface GetHintAction {
    type: typeof GET_HINT;
}

export interface PostBuddyMessageAction {
    type: typeof POST_CHAT_MESSAGE;
    payload: {
        message: ChatMessage;
    };
}

export interface ResetProgressAction {
    type: typeof RESET_PROGRESS;
}

export interface ToggleNotebookAction {
    type: typeof TOGGLE_NOTEBOOK;
}

export interface NextLevelAction {
    type: typeof NEXT_LEVEL;
}

export interface CodeClickAction {
    type: typeof CODE_CLICK;
    payload: {
        lineIndex: number;
        colIndex: number;
        token: string;
    };
}

export interface SetTypingAnimationCompleteAction {
    type: typeof SET_TYPING_ANIMATION_COMPLETE;
    payload: {
        isComplete: boolean;
    };
}

export type GameAction =
    | LoadLevelAction
    | ApplyFixAction
    | WrongClickAction
    | GetHintAction
    | PostBuddyMessageAction
    | ResetProgressAction
    | ToggleNotebookAction
    | NextLevelAction
    | CodeClickAction
    | SetTypingAnimationCompleteAction;

// Action creators
export const loadLevel = (levelId: LevelId): LoadLevelAction => ({
    type: LOAD_LEVEL,
    payload: {levelId}
});

export const applyFix = (eventId: string): ApplyFixAction => ({
    type: APPLY_FIX,
    payload: {eventId}
});

export const wrongClick = (lineIndex: number, colIndex: number, token: string): WrongClickAction => ({
    type: WRONG_CLICK,
    payload: {lineIndex, colIndex, token}
});

export const getHint = (): GetHintAction => ({
    type: GET_HINT
});

export const postChatMessage = (message: ChatMessage): PostBuddyMessageAction => ({
    type: POST_CHAT_MESSAGE,
    payload: {message}
});

export const resetProgress = (): ResetProgressAction => ({
    type: RESET_PROGRESS
});

export const toggleNotebook = (): ToggleNotebookAction => ({
    type: TOGGLE_NOTEBOOK
});

export const nextLevel = (): NextLevelAction => ({
    type: NEXT_LEVEL
});

export const codeClick = (lineIndex: number, colIndex: number, token: string): CodeClickAction => ({
    type: CODE_CLICK,
    payload: {lineIndex, colIndex, token}
});

export const setTypingAnimationComplete = (isComplete: boolean): SetTypingAnimationCompleteAction => ({
    type: SET_TYPING_ANIMATION_COMPLETE,
    payload: {isComplete}
});