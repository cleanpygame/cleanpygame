/**
 * Type definitions for the application
 */
import {EventRegion} from "./utils/regions.ts";

export interface LevelId {
    topic: string;
    levelId: string;
}

export interface WisdomEntry {
    id: string;
    text: string;
}

export interface LevelBlock {
    type: string;
    text?: string;
    clickable?: string;
    replacement?: string;
    event?: string;
    explanation?: string;
    hint?: string;
}

export interface LevelData {
    filename: string;
    wisdoms: string[];
    blocks: LevelBlock[];
    instructions?: string;
    startMessage?: string | undefined;
    startReply?: string | undefined;
    finalMessage?: string | undefined;
    endReply?: string | undefined;
}

export interface Topic {
    name: string;
    wisdoms: WisdomEntry[];
    levels: LevelData[];
}

export type ChatMessageType =
    'me'
    | 'buddy-instruct'
    | 'buddy-explain'
    | 'buddy-help'
    | 'buddy-reject'
    | 'buddy-summarize';

export interface ChatMessage {
    type: ChatMessageType;
    text: string;
}

export interface LevelState {
    level: LevelData;
    triggeredEvents: string[];
    pendingHintId: string | null;
    code: string;
    isFinished: boolean;
    regions: EventRegion[];
    startTime: number;           // timestamp when the level was started
    sessionHintsUsed: number;    // number of hints used in the current session
    sessionMistakesMade: number; // number of mistakes made in the current session
}

export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

/**
 * Player summary statistics
 */
export interface PlayerSummaryStats {
    totalTimeSpent: number;         // total time spent in the game
    totalLevelsSolved: number;      // number of unique levels completed at least once
    totalLevelCompletions: number;  // total number of level completion (including repeats)
    totalHintsUsed: number;         // total number of hints used
    totalMistakesMade: number;      // total number of mistakes made
}

/**
 * Player statistics for a specific level
 */
export interface PlayerLevelStats {
    timesCompleted: number;         // number of times this level was completed
    totalTimeSpent: number;         // total time spent on this level
    totalHintsUsed: number;         // total number of hints used on this level
    totalMistakesMade: number;      // total number of mistakes made on this level
    minTimeSpent: number;           // shortest successful completion time for this level
    minHintsUsed: number;           // minimum hints used in a successful run
    minMistakesMade: number;        // minimum mistakes made in a successful run
}

/**
 * Player statistics state
 */
export interface PlayerStatsState {
    summary: PlayerSummaryStats;
    levels: Record<string, PlayerLevelStats>; // key format: topic__levelFilenameWithoutExtension
}

/**
 * Group member statistics
 */
export interface GroupMember {
    displayName: string;
    levelsCompleted: number;
    totalLevelsPlayed: number;
    totalMisclicks: number;
    totalTimeSpent: number;
    totalHintsUsed: number;
    totalWrongClicks: number;
    lastPlayedAt: string;
    joinedAt: string;
    uid: string;
}

/**
 * Group data structure
 */
export interface Group {
    id: string;
    name: string;
    ownerUid: string;
    ownerName: string;
    ownerEmail?: string;
    createdAt: string;
    updatedAt: string;
    deleted: boolean;
    deletedAt?: string;
    joinedAt?: string;
    memberCount?: number;
}

/**
 * Join code data structure
 */
export interface JoinCode {
    groupId: string;
    ownerUid: string;
    createdAt: string;
    active: boolean;
    deleted: boolean;
}

export interface GameState {
    topics: Topic[];
    currentLevelId: LevelId;
    currentLevel: LevelState;
    discoveredWisdoms: string[];
    notebookOpen: boolean;
    chatMessages: ChatMessage[];
    isTypingAnimationComplete: boolean;
    auth: AuthState;
    playerStats: PlayerStatsState;
    ownedGroups: Group[];
    joinedGroups: Group[];
    selectedGroup?: Group;
    isGroupsLoading: boolean;
    groupsError?: string;
}
