import {
    APPLY_FIX,
    CODE_CLICK,
    CREATE_GROUP_FAILURE,
    CREATE_GROUP_REQUEST,
    CREATE_GROUP_SUCCESS,
    DELETE_GROUP_FAILURE,
    DELETE_GROUP_REQUEST,
    DELETE_GROUP_SUCCESS,
    FETCH_GROUP_BY_ID_FAILURE,
    FETCH_GROUP_BY_ID_REQUEST,
    FETCH_GROUP_BY_ID_SUCCESS,
    FETCH_GROUP_BY_JOIN_CODE_FAILURE,
    FETCH_GROUP_BY_JOIN_CODE_REQUEST,
    FETCH_GROUP_BY_JOIN_CODE_SUCCESS,
    FETCH_GROUPS_FAILURE,
    FETCH_GROUPS_REQUEST,
    FETCH_GROUPS_SUCCESS,
    GET_HINT,
    JOIN_GROUP_FAILURE,
    JOIN_GROUP_REQUEST,
    JOIN_GROUP_SUCCESS,
    LOAD_COMMUNITY_LEVEL,
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
    TOGGLE_JOIN_CODE_ACTIVE_FAILURE,
    TOGGLE_JOIN_CODE_ACTIVE_REQUEST,
    TOGGLE_JOIN_CODE_ACTIVE_SUCCESS,
    TOGGLE_NOTEBOOK,
    UPDATE_GROUP_NAME_FAILURE,
    UPDATE_GROUP_NAME_REQUEST,
    UPDATE_GROUP_NAME_SUCCESS,
    UPDATE_LEVEL_STATS,
    WRONG_CLICK
} from './actionTypes';
import {ChatMessage, Group, LevelData, LevelId, PlayerLevelStats, PlayerStatsState, User} from '../types';

// Action interfaces
export interface LoadLevelAction {
    type: typeof LOAD_LEVEL;
    payload: {
        levelId: LevelId;
    };
}

export interface LoadCommunityLevelAction {
    type: typeof LOAD_COMMUNITY_LEVEL;
    payload: {
        levelId: string;
        levelData: LevelData;
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

// Fetch group by ID action interfaces
export interface FetchGroupByIdRequestAction {
    type: typeof FETCH_GROUP_BY_ID_REQUEST;
    payload: {
        groupId: string;
    };
}

export interface FetchGroupByIdSuccessAction {
    type: typeof FETCH_GROUP_BY_ID_SUCCESS;
    payload: {
        group: Group;
    };
}

export interface FetchGroupByIdFailureAction {
    type: typeof FETCH_GROUP_BY_ID_FAILURE;
    payload: {
        error: string;
    };
}

// Update group name action interfaces
export interface UpdateGroupNameRequestAction {
    type: typeof UPDATE_GROUP_NAME_REQUEST;
    payload: {
        groupId: string;
        newName: string;
    };
}

export interface UpdateGroupNameSuccessAction {
    type: typeof UPDATE_GROUP_NAME_SUCCESS;
    payload: {
        groupId: string;
        newName: string;
    };
}

export interface UpdateGroupNameFailureAction {
    type: typeof UPDATE_GROUP_NAME_FAILURE;
    payload: {
        error: string;
    };
}

// Toggle join code active action interfaces
export interface ToggleJoinCodeActiveRequestAction {
    type: typeof TOGGLE_JOIN_CODE_ACTIVE_REQUEST;
    payload: {
        joinCode: string;
        isActive: boolean;
    };
}

export interface ToggleJoinCodeActiveSuccessAction {
    type: typeof TOGGLE_JOIN_CODE_ACTIVE_SUCCESS;
    payload: {
        joinCode: string;
        isActive: boolean;
    };
}

export interface ToggleJoinCodeActiveFailureAction {
    type: typeof TOGGLE_JOIN_CODE_ACTIVE_FAILURE;
    payload: {
        error: string;
    };
}

// Delete group action interfaces
export interface DeleteGroupRequestAction {
    type: typeof DELETE_GROUP_REQUEST;
    payload: {
        groupId: string;
    };
}

export interface DeleteGroupSuccessAction {
    type: typeof DELETE_GROUP_SUCCESS;
    payload: {
        groupId: string;
    };
}

export interface DeleteGroupFailureAction {
    type: typeof DELETE_GROUP_FAILURE;
    payload: {
        error: string;
    };
}

// Fetch group by join code action interfaces
export interface FetchGroupByJoinCodeRequestAction {
    type: typeof FETCH_GROUP_BY_JOIN_CODE_REQUEST;
    payload: {
        joinCode: string;
    };
}

export interface FetchGroupByJoinCodeSuccessAction {
    type: typeof FETCH_GROUP_BY_JOIN_CODE_SUCCESS;
    payload: {
        group: Group;
    };
}

export interface FetchGroupByJoinCodeFailureAction {
    type: typeof FETCH_GROUP_BY_JOIN_CODE_FAILURE;
    payload: {
        error: string;
    };
}

// Join group action interfaces
export interface JoinGroupRequestAction {
    type: typeof JOIN_GROUP_REQUEST;
    payload: {
        groupId: string;
        displayName?: string;
    };
}

export interface JoinGroupSuccessAction {
    type: typeof JOIN_GROUP_SUCCESS;
    payload: {
        group: Group;
    };
}

export interface JoinGroupFailureAction {
    type: typeof JOIN_GROUP_FAILURE;
    payload: {
        error: string;
    };
}

export type GameAction =
    | LoadLevelAction
    | LoadCommunityLevelAction
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
    | SelectGroupAction
    | FetchGroupByIdRequestAction
    | FetchGroupByIdSuccessAction
    | FetchGroupByIdFailureAction
    | UpdateGroupNameRequestAction
    | UpdateGroupNameSuccessAction
    | UpdateGroupNameFailureAction
    | ToggleJoinCodeActiveRequestAction
    | ToggleJoinCodeActiveSuccessAction
    | ToggleJoinCodeActiveFailureAction
    | DeleteGroupRequestAction
    | DeleteGroupSuccessAction
    | DeleteGroupFailureAction
    | FetchGroupByJoinCodeRequestAction
    | FetchGroupByJoinCodeSuccessAction
    | FetchGroupByJoinCodeFailureAction
    | JoinGroupRequestAction
    | JoinGroupSuccessAction
    | JoinGroupFailureAction;

// Action creators
export const loadLevel = (levelId: LevelId): LoadLevelAction => ({
    type: LOAD_LEVEL,
    payload: {levelId}
});

export const loadCommunityLevel = (levelId: string, levelData: LevelData): LoadCommunityLevelAction => ({
    type: LOAD_COMMUNITY_LEVEL,
    payload: {levelId, levelData}
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


// Fetch group by ID action creators
export const fetchGroupByIdRequest = (groupId: string): FetchGroupByIdRequestAction => ({
    type: FETCH_GROUP_BY_ID_REQUEST,
    payload: {groupId}
});

export const fetchGroupByIdSuccess = (group: Group): FetchGroupByIdSuccessAction => ({
    type: FETCH_GROUP_BY_ID_SUCCESS,
    payload: {group}
});

export const fetchGroupByIdFailure = (error: string): FetchGroupByIdFailureAction => ({
    type: FETCH_GROUP_BY_ID_FAILURE,
    payload: {error}
});

// Update group name action creators
export const updateGroupNameRequest = (groupId: string, newName: string): UpdateGroupNameRequestAction => ({
    type: UPDATE_GROUP_NAME_REQUEST,
    payload: {groupId, newName}
});

export const updateGroupNameSuccess = (groupId: string, newName: string): UpdateGroupNameSuccessAction => ({
    type: UPDATE_GROUP_NAME_SUCCESS,
    payload: {groupId, newName}
});

export const updateGroupNameFailure = (error: string): UpdateGroupNameFailureAction => ({
    type: UPDATE_GROUP_NAME_FAILURE,
    payload: {error}
});

// Toggle join code active action creators
export const toggleJoinCodeActiveRequest = (joinCode: string, isActive: boolean): ToggleJoinCodeActiveRequestAction => ({
    type: TOGGLE_JOIN_CODE_ACTIVE_REQUEST,
    payload: {joinCode, isActive}
});

export const toggleJoinCodeActiveSuccess = (joinCode: string, isActive: boolean): ToggleJoinCodeActiveSuccessAction => ({
    type: TOGGLE_JOIN_CODE_ACTIVE_SUCCESS,
    payload: {joinCode, isActive}
});

export const toggleJoinCodeActiveFailure = (error: string): ToggleJoinCodeActiveFailureAction => ({
    type: TOGGLE_JOIN_CODE_ACTIVE_FAILURE,
    payload: {error}
});

// Delete group action creators
export const deleteGroupRequest = (groupId: string): DeleteGroupRequestAction => ({
    type: DELETE_GROUP_REQUEST,
    payload: {groupId}
});

export const deleteGroupSuccess = (groupId: string): DeleteGroupSuccessAction => ({
    type: DELETE_GROUP_SUCCESS,
    payload: {groupId}
});

export const deleteGroupFailure = (error: string): DeleteGroupFailureAction => ({
    type: DELETE_GROUP_FAILURE,
    payload: {error}
});

// Fetch group by join code action creators
export const fetchGroupByJoinCodeRequest = (joinCode: string): FetchGroupByJoinCodeRequestAction => ({
    type: FETCH_GROUP_BY_JOIN_CODE_REQUEST,
    payload: {joinCode}
});

export const fetchGroupByJoinCodeSuccess = (group: Group): FetchGroupByJoinCodeSuccessAction => ({
    type: FETCH_GROUP_BY_JOIN_CODE_SUCCESS,
    payload: {group}
});

export const fetchGroupByJoinCodeFailure = (error: string): FetchGroupByJoinCodeFailureAction => ({
    type: FETCH_GROUP_BY_JOIN_CODE_FAILURE,
    payload: {error}
});

// Join group action creators
export const joinGroupRequest = (groupId: string, displayName?: string): JoinGroupRequestAction => ({
    type: JOIN_GROUP_REQUEST,
    payload: {groupId, displayName}
});

export const joinGroupSuccess = (group: Group): JoinGroupSuccessAction => ({
    type: JOIN_GROUP_SUCCESS,
    payload: {group}
});

export const joinGroupFailure = (error: string): JoinGroupFailureAction => ({
    type: JOIN_GROUP_FAILURE,
    payload: {error}
});

// Thunk action creator for deleting a group
export const deleteGroupThunk = (groupId: string) => {
    return async (dispatch: React.Dispatch<GameAction>) => {
        try {
            dispatch(deleteGroupRequest(groupId));

            const {deleteGroup} = await import('../firebase/firestore');
            await deleteGroup(groupId);

            dispatch(deleteGroupSuccess(groupId));
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch(deleteGroupFailure(errorMessage));
            throw error;
        }
    };
};

// Thunk action creator for fetching a group by ID
export const fetchGroupByIdThunk = (groupId: string) => {
    return async (dispatch: React.Dispatch<GameAction>) => {
        try {
            dispatch(fetchGroupByIdRequest(groupId));

            const {fetchGroupById} = await import('../firebase/firestore');
            const group = await fetchGroupById(groupId);

            if (!group) {
                throw new Error('Group not found');
            }

            dispatch(fetchGroupByIdSuccess(group));
            return group;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch(fetchGroupByIdFailure(errorMessage));
            throw error;
        }
    };
};

// Thunk action creator for updating a group's name
export const updateGroupNameThunk = (groupId: string, newName: string) => {
    return async (dispatch: React.Dispatch<GameAction>, getState: () => any) => {
        try {
            dispatch(updateGroupNameRequest(groupId, newName));

            const {updateGroupName} = await import('../firebase/firestore');
            await updateGroupName(groupId, newName);

            dispatch(updateGroupNameSuccess(groupId, newName));

            // Update the group in the state
            const state = getState();
            const {ownedGroups, selectedGroup} = state;

            // If the updated group is the selected group, update it
            if (selectedGroup && selectedGroup.id === groupId) {
                dispatch(selectGroup({
                    ...selectedGroup,
                    name: newName
                }));
            }

            // Update the group in the ownedGroups array
            const updatedOwnedGroups = ownedGroups.map((group: { id: string; }) =>
                group.id === groupId ? {...group, name: newName} : group
            );

            dispatch(fetchGroupsSuccess(updatedOwnedGroups, state.joinedGroups));

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch(updateGroupNameFailure(errorMessage));
            throw error;
        }
    };
};

// Thunk action creator for toggling a join code's active status
export const toggleJoinCodeActiveThunk = (joinCode: string, isActive: boolean) => {
    return async (dispatch: React.Dispatch<GameAction>) => {
        try {
            dispatch(toggleJoinCodeActiveRequest(joinCode, isActive));

            const {toggleJoinCodeActive} = await import('../firebase/firestore');
            await toggleJoinCodeActive(joinCode, isActive);

            dispatch(toggleJoinCodeActiveSuccess(joinCode, isActive));
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch(toggleJoinCodeActiveFailure(errorMessage));
            throw error;
        }
    };
};

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
            const result = await createGroup(user, groupName);
            const {group} = result;

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

// Thunk action creator for fetching a group by join code
export const fetchGroupByJoinCodeThunk = (joinCode: string) => {
    return async (dispatch: React.Dispatch<GameAction>) => {
        try {
            dispatch(fetchGroupByJoinCodeRequest(joinCode));

            const {fetchGroupByJoinCode} = await import('../firebase/firestore');
            const group = await fetchGroupByJoinCode(joinCode);

            if (!group) {
                throw new Error('Group not found or join code is inactive');
            }

            dispatch(fetchGroupByJoinCodeSuccess(group));
            return group;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch(fetchGroupByJoinCodeFailure(errorMessage));
            throw error;
        }
    };
};

// Thunk action creator for joining a group
export const joinGroupThunk = (groupId: string, displayName?: string) => {
    return async (dispatch: React.Dispatch<GameAction>, getState: () => any) => {
        try {
            dispatch(joinGroupRequest(groupId, displayName));

            const state = getState();
            const {user} = state.auth;

            if (!user) {
                throw new Error('User must be authenticated to join a group');
            }

            const {joinGroup} = await import('../firebase/firestore');
            const group = await joinGroup(groupId, user, displayName);

            dispatch(joinGroupSuccess(group));

            // Update the joined groups in the state
            // Call the thunk function directly with dispatch and getState
            await fetchGroupsThunk()(dispatch, getState);

            return group;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch(joinGroupFailure(errorMessage));
            throw error;
        }
    };
};
