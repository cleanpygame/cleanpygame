// Firestore functions for player progress and group management
import {
    collection,
    doc,
    DocumentReference,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import {db} from './index';
import {Group, JoinCode, PlayerStatsState, User} from '../types';
import {createDefaultPlayerStats} from '../reducers/statsReducer';

/**
 * Get the player document reference
 * @param userId - User ID
 * @returns Firestore document reference
 */
export const getPlayerDocRef = (userId: string): DocumentReference => {
    return doc(db, 'playerStats', userId);
};

/**
 * Save player statistics to Firestore
 * @param user - Firebase user
 * @param playerStats - Player statistics state
 * @returns Promise that resolves when the operation is complete
 */
export const savePlayerStats = async (user: User, playerStats: PlayerStatsState): Promise<void> => {
    if (!user) return;

    const playerDocRef = getPlayerDocRef(user.uid);

    try {
        // Check if the document exists
        const docSnap = await getDoc(playerDocRef);

        if (docSnap.exists()) {
            // Update existing document
            await updateDoc(playerDocRef, {
                'summary': playerStats.summary,
                'levels': playerStats.levels,
                'updatedAt': serverTimestamp()
            });
        } else {
            // Create new document
            await setDoc(playerDocRef, {
                playerId: user.uid,
                displayName: user.displayName,
                email: user.email,
                summary: playerStats.summary,
                levels: playerStats.levels,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error saving player statistics:', error);
        throw error;
    }
};


/**
 * Load player statistics from Firestore
 * @param user - Firebase user
 * @returns Promise that resolves with the player statistics state
 */
export const loadPlayerStats = async (user: User): Promise<PlayerStatsState> => {
    if (!user) return createDefaultPlayerStats();

    const playerDocRef = getPlayerDocRef(user.uid);

    try {
        const docSnap = await getDoc(playerDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();

            // Check if the document has the expected structure
            if (data.summary && data.levels) {
                return {
                    summary: data.summary,
                    levels: data.levels
                };
            } else {
                // If the document doesn't have the expected structure, return default stats
                console.warn('Player document does not have the expected structure, using default stats');
                return createDefaultPlayerStats();
            }
        }

        // If the document doesn't exist, return default stats
        return createDefaultPlayerStats();
    } catch (error) {
        console.error('Error loading player statistics:', error);
        return createDefaultPlayerStats();
    }
};

/**
 * Generate a random join code
 * @returns A random 8-character alphanumeric code
 */
export const generateJoinCode = (): string => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

/**
 * Create a new group in Firestore
 * @param user - Firebase user (owner)
 * @param name - Group name
 * @returns Promise that resolves with the created group
 */
export const createGroup = async (user: User, name: string): Promise<Group> => {
    if (!user) throw new Error('User must be authenticated to create a group');

    // Generate a unique join code
    const joinCode = generateJoinCode();

    // Create the group document
    const groupsCollection = collection(db, 'groups');
    const groupDoc = doc(groupsCollection);
    const groupId = groupDoc.id;

    const now = new Date().toISOString();

    // Create the group object
    const group: Group = {
        id: groupId,
        name,
        ownerUid: user.uid,
        ownerName: user.displayName || 'Unknown',
        ownerEmail: user.email || undefined,
        joinCode,
        memberIds: [],
        memberSummaries: {},
        createdAt: now,
        updatedAt: now,
        deleted: false
    };

    try {
        // Save the group to Firestore
        await setDoc(groupDoc, {
            ...group,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Create the join code document
        const joinCodeDoc = doc(db, 'joinCodes', joinCode);
        const joinCodeData: JoinCode = {
            groupId,
            ownerUid: user.uid,
            createdAt: now,
            active: true,
            deleted: false
        };

        await setDoc(joinCodeDoc, {
            ...joinCodeData,
            createdAt: serverTimestamp()
        });

        return group;
    } catch (error) {
        console.error('Error creating group:', error);
        throw error;
    }
};

/**
 * Fetch groups owned by the user
 * @param userId - User ID
 * @returns Promise that resolves with an array of groups
 */
export const fetchOwnedGroups = async (userId: string): Promise<Group[]> => {
    try {
        const groupsCollection = collection(db, 'groups');
        const q = query(
            groupsCollection,
            where('ownerUid', '==', userId),
            where('deleted', '==', false)
        );

        const querySnapshot = await getDocs(q);
        const groups: Group[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data() as Group;
            groups.push({
                ...data,
                id: doc.id
            });
        });

        return groups;
    } catch (error) {
        console.error('Error fetching owned groups:', error);
        throw error;
    }
};

/**
 * Fetch groups joined by the user
 * @param userId - User ID
 * @returns Promise that resolves with an array of groups
 */
export const fetchJoinedGroups = async (userId: string): Promise<Group[]> => {
    try {
        const groupsCollection = collection(db, 'groups');
        const q = query(
            groupsCollection,
            where('memberIds', 'array-contains', userId),
            where('deleted', '==', false)
        );

        const querySnapshot = await getDocs(q);
        const groups: Group[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data() as Group;
            groups.push({
                ...data,
                id: doc.id
            });
        });

        return groups;
    } catch (error) {
        console.error('Error fetching joined groups:', error);
        throw error;
    }
};
