import {
    APPLY_FIX,
    CODE_CLICK,
    GET_HINT,
    LOAD_LEVEL,
    LOGIN_FAILURE,
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGOUT,
    NEXT_LEVEL,
    POST_CHAT_MESSAGE,
    RESET_PROGRESS,
    SET_PLAYER_STATS,
    SET_TYPING_ANIMATION_COMPLETE,
    TOGGLE_NOTEBOOK,
    TOGGLE_STATS_PAGE,
    UPDATE_LEVEL_STATS,
    WRONG_CLICK
} from './actionTypes';
import {ChatMessage, LevelId, PlayerLevelStats, PlayerStatsState, User} from '../types';

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

// Authentication action interfaces
export interface LoginRequestAction {
    type: typeof LOGIN_REQUEST;
}

export interface LoginSuccessAction {
    type: typeof LOGIN_SUCCESS;
    payload: {
        user: User;
    };
}

export interface LoginFailureAction {
    type: typeof LOGIN_FAILURE;
    payload: {
        error: string;
    };
}

export interface LogoutAction {
    type: typeof LOGOUT;
}


export interface UpdateLevelStatsAction {
    type: typeof UPDATE_LEVEL_STATS;
    payload: {
        levelKey: string;
        stats: Partial<PlayerLevelStats>;
        timeSpent?: number;
        isCompleted?: boolean;
        hintsUsed?: number;
        mistakesMade?: number;
    };
}

export interface SetPlayerStatsAction {
    type: typeof SET_PLAYER_STATS;
    payload: {
        playerStats: PlayerStatsState;
    };
}

export interface ToggleStatsPageAction {
    type: typeof TOGGLE_STATS_PAGE;
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
    | SetTypingAnimationCompleteAction
    | LoginRequestAction
    | LoginSuccessAction
    | LoginFailureAction
    | LogoutAction
    | UpdateLevelStatsAction
    | SetPlayerStatsAction
    | ToggleStatsPageAction;

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

// Authentication action creators
export const loginRequest = (): LoginRequestAction => ({
    type: LOGIN_REQUEST
});

export const loginSuccess = (user: User): LoginSuccessAction => ({
    type: LOGIN_SUCCESS,
    payload: {user}
});

export const loginFailure = (error: string): LoginFailureAction => ({
    type: LOGIN_FAILURE,
    payload: {error}
});

export const logout = (): LogoutAction => ({
    type: LOGOUT
});


/**
 * Update statistics for a specific level
 * @param levelKey - Level key in format topic__levelFilenameWithoutExtension
 * @param stats - Partial level statistics to update
 * @param timeSpent - Time spent on the level in this session
 * @param isCompleted - Whether the level was completed in this session
 * @param hintsUsed - Number of hints used in this session
 * @param mistakesMade - Number of mistakes made in this session
 * @returns Action to update level statistics
 */
export const updateLevelStats = (
    levelKey: string,
    stats: Partial<PlayerLevelStats> = {},
    timeSpent?: number,
    isCompleted?: boolean,
    hintsUsed?: number,
    mistakesMade?: number
): UpdateLevelStatsAction => ({
    type: UPDATE_LEVEL_STATS,
    payload: {
        levelKey,
        stats,
        timeSpent,
        isCompleted,
        hintsUsed,
        mistakesMade
    }
});

/**
 * Set the entire player statistics state
 * @param playerStats - Player statistics state
 * @returns Action to set player statistics
 */
export const setPlayerStats = (playerStats: PlayerStatsState): SetPlayerStatsAction => ({
    type: SET_PLAYER_STATS,
    payload: {playerStats}
});

/**
 * Toggle the visibility of the player statistics page
 * @returns Action to toggle stats page visibility
 */
export const toggleStatsPage = (): ToggleStatsPageAction => ({
    type: TOGGLE_STATS_PAGE
});

// Thunk action creator for Google sign-in
export const signInWithGoogle = () => {
    return async (dispatch: React.Dispatch<GameAction>) => {
        try {
            dispatch(loginRequest());
            const {signInWithGoogle: firebaseSignInWithGoogle} = await import('../firebase/auth');
            const result = await firebaseSignInWithGoogle();

            if (result.user) {
                const user: User = {
                    uid: result.user.uid,
                    displayName: result.user.displayName,
                    email: result.user.email,
                    photoURL: result.user.photoURL
                };
                dispatch(loginSuccess(user));
            }
        } catch (error) {
            dispatch(loginFailure(error instanceof Error ? error.message : 'An unknown error occurred'));
        }
    };
};

// Thunk action creator for sign-out
export const signOut = () => {
    return async (dispatch: React.Dispatch<GameAction>) => {
        try {
            const {signOut: firebaseSignOut} = await import('../firebase/auth');
            await firebaseSignOut();
            dispatch(logout());
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };
};
