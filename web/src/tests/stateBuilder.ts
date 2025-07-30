/**
 * State Builder for the Clean Code Game
 * Provides a chainable API for building mock state objects for tests
 */
import {vi} from 'vitest';
import {GameState, LevelData, PlayerLevelStats, Topic} from '../types';

/**
 * Creates a basic level object for testing
 */
function createMockLevel(filename: string): LevelData {
    return {
        filename,
        blocks: [],
        instructions: `Instructions for ${filename}`,
    };
}

/**
 * StateBuilder class for creating mock state objects using the Builder pattern
 */
export class StateBuilder {
    private state: GameState;

    constructor() {
        // Initialize with empty state
        this.state = {
            topics: [],
            currentLevelId: {topic: '', levelId: ''},
            currentLevel: {
                level: {filename: '', blocks: []},
                triggeredEvents: [],
                pendingHintId: null,
                code: '',
                isFinished: false,
                regions: [],
                startTime: 0,
                sessionHintsUsed: 0,
                sessionMistakesMade: 0
            },
            chatMessages: [],
            isTypingAnimationComplete: true,
            auth: {
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
                isAdmin: false
            },
            playerStats: {
                summary: {
                    totalTimeSpent: 0,
                    totalLevelsSolved: 0,
                    totalLevelCompletions: 0,
                    totalHintsUsed: 0,
                    totalMistakesMade: 0
                },
                levels: {}
            },
            ownedGroups: [],
            joinedGroups: [],
            isGroupsLoading: false,
            userLevels: [],
            customLevels: {}
        };
    }

    /**
     * Initialize with default state values
     */
    withDefault(): StateBuilder {
        this.state.currentLevelId = {topic: 'topic1', levelId: 'level1.py'};
        this.state.currentLevel = {
            level: createMockLevel('level1.py'),
            triggeredEvents: [],
            pendingHintId: null,
            code: '',
            isFinished: false,
            regions: [],
            startTime: Date.now(),
            sessionHintsUsed: 0,
            sessionMistakesMade: 0
        };
        return this;
    }

    /**
     * Add default topics and levels to the state
     */
    withTopics(): StateBuilder {
        this.state.topics = [
            {
                name: 'topic1',
                levels: [
                    createMockLevel('level1.py'),
                    createMockLevel('level2.py'),
                    createMockLevel('level3.py')
                ]
            },
            {
                name: 'topic2',
                levels: [
                    createMockLevel('level1.py'),
                    createMockLevel('level2.py')
                ]
            }
        ];
        return this;
    }

    /**
     * Add custom topics to the state
     */
    withCustomTopics(topics: Topic[]): StateBuilder {
        this.state.topics = topics;
        return this;
    }

    /**
     * Add a completed level to the state
     */
    withCompletedLevel(topic: string = 'topic1', levelId: string = 'level1.py'): StateBuilder {
        // Ensure we have topics first
        if (this.state.topics.length === 0) {
            this.withTopics();
        }

        const levelKey = `${topic}__${levelId.replace('.py', '')}`;

        // Create level stats
        const levelStats: PlayerLevelStats = {
            timesCompleted: 1,
            totalTimeSpent: 60,
            totalHintsUsed: 0,
            totalMistakesMade: 0,
            minTimeSpent: 60,
            minHintsUsed: 0,
            minMistakesMade: 0
        };

        // Update player stats
        this.state.playerStats = {
            summary: {
                totalTimeSpent: 60,
                totalLevelsSolved: 1,
                totalLevelCompletions: 1,
                totalHintsUsed: 0,
                totalMistakesMade: 0
            },
            levels: {
                [levelKey]: levelStats
            }
        };

        return this;
    }

    /**
     * Set the current level ID
     */
    withCurrentLevel(topic: string, levelId: string): StateBuilder {
        this.state.currentLevelId = {topic, levelId};
        this.state.currentLevel.level = createMockLevel(levelId);
        return this;
    }

    /**
     * Add an authenticated user to the state
     */
    asAuthenticatedUser(isAdmin: boolean = false): StateBuilder {
        this.state.auth = {
            user: {
                uid: 'test-user-id',
                displayName: 'Test User',
                email: 'test@example.com',
                photoURL: null
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isAdmin
        };
        return this;
    }

    /**
     * Set the user as an admin
     */
    asAdmin(): StateBuilder {
        return this.asAuthenticatedUser(true);
    }

    /**
     * Customize specific parts of the state
     */
    withCustomization(customizer: (state: GameState) => void): StateBuilder {
        customizer(this.state);
        return this;
    }

    /**
     * Build and return the final state
     */
    build(): GameState {
        return {...this.state};
    }
}

/**
 * Creates a mock dispatch function for testing
 */
export const mockDispatch = vi.fn();

/**
 * Helper function to create a default state builder with common defaults
 */
export function createStateBuilder(): StateBuilder {
    return new StateBuilder().withDefault();
}