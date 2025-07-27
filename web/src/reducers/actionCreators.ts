import {
    APPLY_FIX,
    CODE_CLICK,
    CREATE_GROUP_FAILURE,
    CREATE_GROUP_REQUEST,
    CREATE_GROUP_SUCCESS,
    FETCH_GROUPS_FAILURE,
    FETCH_GROUPS_REQUEST,
    FETCH_GROUPS_SUCCESS,
    GET_HINT,
    LOAD_LEVEL,
    LOGIN_FAILURE,
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGOUT,
    NEXT_LEVEL,
    POST_CHAT_MESSAGE,
    RESET_PROGRESS,
    SELECT_GROUP,
    SET_PLAYER_STATS,
    SET_TYPING_ANIMATION_COMPLETE,
    TOGGLE_NOTEBOOK,
    UPDATE_LEVEL_STATS,
    WRONG_CLICK
} from './actionTypes';
import {ChatMessage, Group, LevelId, PlayerLevelStats, PlayerStatsState, User} from '../types';

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

// Group management action interfaces
export interface CreateGroupRequestAction {
    type: typeof CREATE_GROUP_REQUEST;
}

export interface CreateGroupSuccessAction {
    type: typeof CREATE_GROUP_SUCCESS;
    payload: {
        group: Group;
    };
}

export interface CreateGroupFailureAction {
    type: typeof CREATE_GROUP_FAILURE;
    payload: {
        error: string;
    };
}

export interface FetchGroupsRequestAction {
    type: typeof FETCH_GROUPS_REQUEST;
}

export interface FetchGroupsSuccessAction {
    type: typeof FETCH_GROUPS_SUCCESS;
    payload: {
        ownedGroups: Group[];
        joinedGroups: Group[];
    };
}

export interface FetchGroupsFailureAction {
    type: typeof FETCH_GROUPS_FAILURE;
    payload: {
        error: string;
    };
}

export interface SelectGroupAction {
    type: typeof SELECT_GROUP;
    payload: {
        group: Group;
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
    | SetTypingAnimationCompleteAction
    | LoginRequestAction
    | LoginSuccessAction
    | LoginFailureAction
    | LogoutAction
    | UpdateLevelStatsAction
    | SetPlayerStatsAction
    | CreateGroupRequestAction
    | CreateGroupSuccessAction
    | CreateGroupFailureAction
    | FetchGroupsRequestAction
    | FetchGroupsSuccessAction
    | FetchGroupsFailureAction
    | SelectGroupAction;

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

// Group management action creators
export const createGroupRequest = (): CreateGroupRequestAction => ({
    type: CREATE_GROUP_REQUEST
});

export const createGroupSuccess = (group: Group): CreateGroupSuccessAction => ({
    type: CREATE_GROUP_SUCCESS,
    payload: {group}
});

export const createGroupFailure = (error: string): CreateGroupFailureAction => ({
    type: CREATE_GROUP_FAILURE,
    payload: {error}
});

export const fetchGroupsRequest = (): FetchGroupsRequestAction => ({
    type: FETCH_GROUPS_REQUEST
});

export const fetchGroupsSuccess = (ownedGroups: Group[], joinedGroups: Group[]): FetchGroupsSuccessAction => ({
    type: FETCH_GROUPS_SUCCESS,
    payload: {ownedGroups, joinedGroups}
});

export const fetchGroupsFailure = (error: string): FetchGroupsFailureAction => ({
    type: FETCH_GROUPS_FAILURE,
    payload: {error}
});

export const selectGroup = (group: Group): SelectGroupAction => ({
    type: SELECT_GROUP,
    payload: {group}
});

// Thunk action creator for creating a group
export const createGroupThunk = (groupName: string) => {
    return async (dispatch: React.Dispatch<GameAction>, getState: () => any) => {
        try {
            dispatch(createGroupRequest());

            const state = getState();
            const {user} = state.auth;

            if (!user) {
                throw new Error('User must be authenticated to create a group');
            }

            const {createGroup} = await import('../firebase/firestore');
            const group = await createGroup(user, groupName);

            dispatch(createGroupSuccess(group));
            return group;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch(createGroupFailure(errorMessage));
            throw error;
        }
    };
};

// Thunk action creator for fetching groups
export const fetchGroupsThunk = () => {
    return async (dispatch: React.Dispatch<GameAction>, getState: () => any) => {
        try {
            dispatch(fetchGroupsRequest());

            const state = getState();
            const {user} = state.auth;

            if (!user) {
                throw new Error('User must be authenticated to fetch groups');
            }

            const {fetchOwnedGroups, fetchJoinedGroups} = await import('../firebase/firestore');
            const [ownedGroups, joinedGroups] = await Promise.all([
                fetchOwnedGroups(user.uid),
                fetchJoinedGroups(user.uid)
            ]);

            dispatch(fetchGroupsSuccess(ownedGroups, joinedGroups));
            return {ownedGroups, joinedGroups};
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch(fetchGroupsFailure(errorMessage));
            throw error;
        }
    };
};
