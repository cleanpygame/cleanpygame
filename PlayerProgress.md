# Clean Python Game: Player Statistics Design Document

## Overview

This document outlines the design for implementing comprehensive player statistics tracking in the Clean Python Game.
The system will support individual player progress tracking and detailed analytics for both students and teachers.

## Core Design Principles

1. **Player-Centric Statistics**: All detailed statistics are stored per player globally, not per group
2. **Offline-First Approach**: Local statistics are maintained and synced to Firebase when available
3. **Privacy by Design**: Students can only see their own detailed stats; teachers see summaries of their group members
4. **Scalable Architecture**: Design supports future features like real-time updates and advanced analytics

## Data Organization and Storage

### Player Statistics Collection (`playerStats`)

**Document ID**: User UID
**Purpose**: Store comprehensive, global statistics for each player

```
playerStats/{playerId}
├── playerId: string
├── displayName: string
├── email?: string
├── summary: PlayerSummaryStats
├── levels: { [levelKey]: PlayerLevelStats }
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

**Key Design Decisions**:

- **Level Key Format**: Use `topic__levelFilenameWithoutExtension` format to avoid Firestore nested object limitations
- **Aggregated Summaries**: Pre-calculated totals for quick access

## Firebase Security Rules Organization

### Rule Philosophy

- **Principle of Least Privilege**: Users can only access data they need
- **Student Privacy**: Students can only see their own detailed statistics

### Access Patterns

**Player Statistics**:

- Read/Write: Own statistics only
- exception in the future: Teachers can read all stats of their group members

## React State Management

### State Architecture

**Global State Structure**:

```
GameState
├── playerStats: PlayerStatsState
```

**Player Stats State**:

```
PlayerStatsState
├── summary: PlayerSummaryStats
├── levels: { [levelKey]: PlayerLevelStats }
```

```
PlayerSummaryStats
├── totalTimeSpent: number             // total time spent in the game
├── totalLevelsSolved: number          // number of unique levels completed at least once
├── totalLevelCompletions: number      // total number of level completion (including repeats)
├── totalHintsUsed: number             // total number of hints used
├── totalMistakesMade: number          // total number of mistakes made

PlayerLevelStats
├── timesCompleted: number             // number of times this level was completed
├── totalTimeSpent: number             // total time spent on this level
├── totalHintsUsed: number             // total number of hints used on this level
├── totalMistakesMade: number          // total number of mistakes made on this level
├── minTimeSpent: number               // shortest successful completion time for this level
├── minHintsUsed: number               // minimum hints used in a successful run
├── minMistakesMade: number            // minimum mistakes made in a successful run
```

### State Management Patterns

1. **Async Actions (Thunks)**: Handle all Firebase operations
2. **Optimistic Updates**: Update UI immediately, rollback on error
3. **Cache Management**: Store frequently accessed data locally
4. **Sync Strategies**: Periodic sync of local stats to Firebase

### Data Flow Examples

**Level Completion Flow**:

1. Player completes level → Update local game state
2. Update local player statistics
3. If online → Sync to Firebase playerStats
4. Update group member summary for all joined groups
5. Trigger UI updates via state changes

## Detailed Technical Scenarios

### Scenario 1: Player Completes a Level

**Local Updates**:

1. Update `GameState.solvedLevels`
2. Update local player per-level stats (time, hints, misclicks) and summary stats
3. Trigger UI animations and feedback

**Firebase Sync** (if authenticated and online):

1. Update `playerStats/{playerId}/levels/{levelKey}`
2. Update summary statistics

## UI/UX Guidelines

### Page Designs

#### Student Profile

- **Overview**: Personal statistics summary
- **Level Progress**: Grid showing completion status per level with all stats

### Performance Considerations

### Data Loading Strategies

1. **Lazy Loading**: Load detailed stats only when requested

### Firebase Optimization

1. **Composite Indexes**: Optimize common query patterns
2. **Batch Operations**: Group related writes together
3. **Connection Pooling**: Reuse Firebase connections
4. **Offline Persistence**: Enable Firestore offline support