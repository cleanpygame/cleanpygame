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
    autoHintAt: number | null;
    code: string;
    isFinished: boolean;
    regions: EventRegion[];
}

export interface GameState {
    topics: Topic[];
    currentLevelId: LevelId;
    currentLevel: LevelState;
    solvedLevels: LevelId[];
    discoveredWisdoms: string[];
    notebookOpen: boolean;
    chatMessages: ChatMessage[];
}
