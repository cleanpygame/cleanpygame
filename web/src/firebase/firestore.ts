// Firestore functions for player progress, group management, and custom levels
import {
    arrayUnion,
    collection,
    deleteDoc,
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
import {Group, GroupMember, JoinCode, PlayerStatsState, User} from '../types';
import {createDefaultPlayerStats} from '../reducers/statsReducer';

// Custom level types
export interface CustomLevel {
    id: string;
    content: string;
    author_id: string;
    filename: string;
    created_at: any; // serverTimestamp
}

export interface UserLevel {
    level_id: string;
    filename: string;
}

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
/**
 * Update all group member stats for a player
 * @param userId - User ID
 * @param playerStats - Player statistics state
 * @returns Promise that resolves when the operation is complete
 */
export const updateAllGroupMemberStats = async (userId: string, playerStats: PlayerStatsState): Promise<void> => {
    try {
        // Get the player document to access the memberOfGroups array
        const playerDocRef = getPlayerDocRef(userId);
        const playerDoc = await getDoc(playerDocRef);

        if (!playerDoc.exists() || !playerDoc.data().memberOfGroups) {
            // If the player document doesn't exist or doesn't have memberOfGroups, there's nothing to update
            return;
        }

        const memberOfGroups = playerDoc.data().memberOfGroups as string[];

        if (memberOfGroups.length === 0) {
            // If the player is not a member of any groups, there's nothing to update
            return;
        }

        // For each group, update the member document with the new stats
        const updatePromises = memberOfGroups.map(async (groupId) => {
            const memberDocRef = doc(db, 'groups', groupId, 'members', userId);
            const memberDoc = await getDoc(memberDocRef);

            if (!memberDoc.exists()) {
                // If the member document doesn't exist, skip it
                console.warn(`Member document not found for user ${userId} in group ${groupId}`);
                return;
            }

            // Update the member document with stats from player stats
            return updateDoc(memberDocRef, {
                levelsCompleted: playerStats.summary.totalLevelsSolved || 0,
                totalLevelsPlayed: playerStats.summary.totalLevelCompletions || 0,
                totalMisclicks: playerStats.summary.totalMistakesMade || 0,
                totalTimeSpent: playerStats.summary.totalTimeSpent || 0,
                totalHintsUsed: playerStats.summary.totalHintsUsed || 0,
                totalWrongClicks: playerStats.summary.totalMistakesMade || 0,
                lastPlayedAt: new Date().toISOString(),
                updatedAt: serverTimestamp()
            });
        });

        // Wait for all updates to complete
        await Promise.all(updatePromises);
    } catch (error) {
        console.error('Error updating group member stats:', error);
        throw error;
    }
};

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

        // Update all group member stats for this player
        await updateAllGroupMemberStats(user.uid, playerStats);
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
 * @returns Promise that resolves with the created group and join code
 */
export const createGroup = async (user: User, name: string): Promise<{ group: Group, joinCode: string }> => {
    if (!user) throw new Error('User must be authenticated to create a group');

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

        // Create a join code for the group
        const joinCode = await createJoinCode(groupId, user.uid);

        return {group, joinCode};
    } catch (error) {
        console.error('Error creating group:', error);
        throw error;
    }
};

/**
 * Create a join code for a group
 * @param groupId - Group ID
 * @param ownerUid - Owner user ID
 * @returns Promise that resolves with the created join code
 */
export const createJoinCode = async (groupId: string, ownerUid: string): Promise<string> => {
    // Generate a unique join code
    const joinCode = generateJoinCode();
    const now = new Date().toISOString();

    try {
        // Create the join code document
        const joinCodeDoc = doc(db, 'joinCodes', joinCode);
        const joinCodeData: JoinCode = {
            groupId,
            ownerUid,
            createdAt: now,
            active: true,
            deleted: false
        };

        await setDoc(joinCodeDoc, {
            ...joinCodeData,
            createdAt: serverTimestamp()
        });

        return joinCode;
    } catch (error) {
        console.error('Error creating join code:', error);
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

        // First, collect all the groups
        for (const doc of querySnapshot.docs) {
            const data = doc.data() as Group;
            groups.push({
                ...data,
                id: doc.id,
                memberCount: 0 // Initialize with 0, will be updated below
            });
        }

        // Then, for each group, count the members
        for (const group of groups) {
            try {
                const membersCollection = collection(db, 'groups', group.id, 'members');
                const membersSnapshot = await getDocs(membersCollection);
                group.memberCount = membersSnapshot.size;
            } catch (e) {
                console.error(`Error counting members for group ${group.id}:`, e);
                // Keep the default 0 if there's an error
            }
        }

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
        // Get the player stats document to find the groups the user is a member of
        const playerDocRef = getPlayerDocRef(userId);
        const playerDoc = await getDoc(playerDocRef);

        if (!playerDoc.exists() || !playerDoc.data().memberOfGroups) {
            return []; // User hasn't joined any groups
        }

        const memberOfGroups = playerDoc.data().memberOfGroups as string[];

        if (memberOfGroups.length === 0) {
            return [];
        }

        // Fetch the groups the user is a member of
        const groupsCollection = collection(db, 'groups');
        const q = query(
            groupsCollection,
            where('__name__', 'in', memberOfGroups),
            where('deleted', '==', false)
        );

        const querySnapshot = await getDocs(q);
        const groups: Group[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data() as Group;
            groups.push({
                ...data,
                id: doc.id,
                joinedAt: new Date().toISOString() // Placeholder, will be updated below
            });
        });

        // For each group, fetch the member document to get the joinedAt date
        for (const group of groups) {
            try {
                const memberDocRef = doc(db, 'groups', group.id, 'members', userId);
                const memberDoc = await getDoc(memberDocRef);

                if (memberDoc.exists()) {
                    group.joinedAt = memberDoc.data().joinedAt;
                }
            } catch (e) {
                console.error(`Error fetching member document for group ${group.id}:`, e);
            }
        }
        
        return groups;
    } catch (error) {
        console.error('Error fetching joined groups:', error);
        throw error;
    }
};

/**
 * Fetch a single group by ID
 * @param groupId - Group ID
 * @returns Promise that resolves with the group or null if not found
 */
export const fetchGroupById = async (groupId: string): Promise<Group | null> => {
    try {
        const groupDocRef = doc(db, 'groups', groupId);
        const docSnap = await getDoc(groupDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as Group;
            return {
                ...data,
                id: docSnap.id
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching group by ID:', error);
        throw error;
    }
};

/**
 * Fetch members for a group
 * @param groupId - Group ID
 * @returns Promise that resolves with an array of group members
 */
export const fetchGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
    try {
        const membersCollection = collection(db, 'groups', groupId, 'members');
        const querySnapshot = await getDocs(membersCollection);
        const members: GroupMember[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data() as GroupMember;
            members.push({
                ...data,
                uid: doc.id
            });
        });

        return members;
    } catch (error) {
        console.error('Error fetching group members:', error);
        throw error;
    }
};

/**
 * Update a group's name
 * @param groupId - Group ID
 * @param newName - New group name
 * @returns Promise that resolves when the operation is complete
 */
export const updateGroupName = async (groupId: string, newName: string): Promise<void> => {
    try {
        const groupDocRef = doc(db, 'groups', groupId);

        await updateDoc(groupDocRef, {
            name: newName,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating group name:', error);
        throw error;
    }
};

/**
 * Toggle a join code's active status
 * @param joinCode - Join code
 * @param isActive - New active status
 * @returns Promise that resolves when the operation is complete
 */
export const toggleJoinCodeActive = async (joinCode: string, isActive: boolean): Promise<void> => {
    try {
        const joinCodeDocRef = doc(db, 'joinCodes', joinCode);

        await updateDoc(joinCodeDocRef, {
            active: isActive
        });
    } catch (error) {
        console.error('Error toggling join code active status:', error);
        throw error;
    }
};

/**
 * Get a join code's active status
 * @param joinCode - Join code
 * @returns Promise that resolves with the active status or null if not found
 */
export const getJoinCodeActiveStatus = async (joinCode: string): Promise<boolean | null> => {
    try {
        const joinCodeDocRef = doc(db, 'joinCodes', joinCode);
        const docSnap = await getDoc(joinCodeDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.active;
        }

        return null;
    } catch (error) {
        console.error('Error getting join code active status:', error);
        throw error;
    }
};

/**
 * Fetch join codes for a group
 * @param groupId - Group ID
 * @returns Promise that resolves with an array of join codes
 */
export const fetchJoinCodesForGroup = async (groupId: string): Promise<{ code: string, active: boolean }[]> => {
    try {
        const joinCodesCollection = collection(db, 'joinCodes');
        const q = query(
            joinCodesCollection,
            where('groupId', '==', groupId),
            where('deleted', '==', false)
        );

        const querySnapshot = await getDocs(q);
        const joinCodes: { code: string, active: boolean }[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            joinCodes.push({
                code: doc.id,
                active: data.active
            });
        });

        return joinCodes;
    } catch (error) {
        console.error('Error fetching join codes for group:', error);
        throw error;
    }
};

/**
 * Delete a group (soft delete)
 * @param groupId - Group ID
 * @returns Promise that resolves when the operation is complete
 */
export const deleteGroup = async (groupId: string): Promise<void> => {
    try {
        const groupDocRef = doc(db, 'groups', groupId);

        await updateDoc(groupDocRef, {
            deleted: true,
            deletedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error deleting group:', error);
        throw error;
    }
};

/**
 * Fetch a group by join code
 * @param joinCode - Join code
 * @returns Promise that resolves with the group or null if not found or inactive
 */
export const fetchGroupByJoinCode = async (joinCode: string): Promise<Group | null> => {
    try {
        // First, check if the join code exists and is active
        const joinCodeDocRef = doc(db, 'joinCodes', joinCode);
        const joinCodeSnap = await getDoc(joinCodeDocRef);

        if (!joinCodeSnap.exists()) {
            return null; // Join code doesn't exist
        }

        const joinCodeData = joinCodeSnap.data() as JoinCode;

        if (!joinCodeData.active || joinCodeData.deleted) {
            return null; // Join code is inactive or deleted
        }

        // Now fetch the group using the groupId from the join code
        const groupDocRef = doc(db, 'groups', joinCodeData.groupId);
        const groupSnap = await getDoc(groupDocRef);

        if (!groupSnap.exists() || groupSnap.data().deleted) {
            return null; // Group doesn't exist or is deleted
        }

        const groupData = groupSnap.data() as Group;
        return {
            ...groupData,
            id: groupSnap.id
        };
    } catch (error) {
        console.error('Error fetching group by join code:', error);
        throw error;
    }
};

/**
 * Join a group
 * @param groupId - Group ID
 * @param user - User joining the group
 * @param displayName - Display name to use in the group (optional, defaults to user's display name)
 * @returns Promise that resolves with the updated group
 */
/**
 * Refresh a member's stats from their player stats
 * @param groupId - Group ID
 * @param memberId - Member ID (user UID)
 * @returns Promise that resolves when the operation is complete
 */
export const refreshMemberStats = async (groupId: string, memberId: string): Promise<void> => {
    try {
        // Get the player stats document
        const playerDocRef = getPlayerDocRef(memberId);
        const playerDoc = await getDoc(playerDocRef);

        if (!playerDoc.exists()) {
            throw new Error('Player stats not found');
        }

        // Get player stats
        const playerStats = {
            summary: playerDoc.data().summary || createDefaultPlayerStats().summary,
            levels: playerDoc.data().levels || {}
        };

        // Get the member document
        const memberDocRef = doc(db, 'groups', groupId, 'members', memberId);
        const memberDoc = await getDoc(memberDocRef);

        if (!memberDoc.exists()) {
            throw new Error('Member not found in group');
        }

        // Update the member document with stats from player stats
        await updateDoc(memberDocRef, {
            levelsCompleted: playerStats.summary.totalLevelsSolved || 0,
            totalLevelsPlayed: playerStats.summary.totalLevelCompletions || 0,
            totalMisclicks: playerStats.summary.totalMistakesMade || 0,
            totalTimeSpent: playerStats.summary.totalTimeSpent || 0,
            totalHintsUsed: playerStats.summary.totalHintsUsed || 0,
            totalWrongClicks: playerStats.summary.totalMistakesMade || 0,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error refreshing member stats:', error);
        throw error;
    }
};

export const joinGroup = async (
    groupId: string,
    user: User,
    displayName?: string
): Promise<Group> => {
    if (!user) throw new Error('User must be authenticated to join a group');

    try {
        // Get the group to make sure it exists
        const group = await fetchGroupById(groupId);
        if (!group) {
            throw new Error('Group not found');
        }

        // Get the player stats document to update the memberOfGroups field
        const playerDocRef = getPlayerDocRef(user.uid);
        const playerDoc = await getDoc(playerDocRef);

        // Check if user is already a member by checking the members subcollection
        const memberDocRef = doc(db, 'groups', groupId, 'members', user.uid);
        const memberDoc = await getDoc(memberDocRef);
        const isMember = memberDoc.exists();
        console.log('[firestore.joinGroup] isMember:', isMember);

        // Get player stats to initialize member stats
        let playerStats = createDefaultPlayerStats();
        if (playerDoc.exists()) {
            playerStats = {
                summary: playerDoc.data().summary || createDefaultPlayerStats().summary,
                levels: playerDoc.data().levels || {}
            };
        }

        if (isMember) {
            await updateDoc(memberDocRef, {
                displayName: displayName || user.displayName || 'Anonymous',
                updatedAt: serverTimestamp()
            });
        } else {
            const memberData: GroupMember = {
                uid: user.uid,
                displayName: displayName || user.displayName || 'Anonymous',
                levelsCompleted: playerStats.summary.totalLevelsSolved || 0,
                totalLevelsPlayed: playerStats.summary.totalLevelCompletions || 0,
                totalMisclicks: playerStats.summary.totalMistakesMade || 0,
                totalTimeSpent: playerStats.summary.totalTimeSpent || 0,
                totalHintsUsed: playerStats.summary.totalHintsUsed || 0,
                totalWrongClicks: playerStats.summary.totalMistakesMade || 0,
                lastPlayedAt: new Date().toISOString(),
                joinedAt: isMember ? memberDoc.data().joinedAt : new Date().toISOString()
            };
            await setDoc(memberDocRef, {
                ...memberData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }

        // Update the player stats document to include this group
        if (playerDoc.exists()) {
            // Update existing document
            await updateDoc(playerDocRef, {
                memberOfGroups: arrayUnion(groupId),
                teacherIds: arrayUnion(group.ownerUid),
                updatedAt: serverTimestamp()
            });
        } else {
            // Create new document
            await setDoc(playerDocRef, {
                playerId: user.uid,
                displayName: user.displayName,
                email: user.email,
                memberOfGroups: [groupId],
                teacherIds: [group.ownerUid],
                summary: createDefaultPlayerStats().summary,
                levels: {},
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }

        return group;
    } catch (error) {
        console.error('Error joining group:', error);
        throw error;
    }
};

/**
 * Recalculate player's group membership and teacher IDs
 * This function filters out deleted and non-existent groups from memberOfGroups
 * and updates teacherIds to only include owners of groups the player is still a member of
 *
 * @param userId - User ID
 * @returns Promise that resolves with the updated memberOfGroups and teacherIds arrays
 */
export const recalculatePlayerGroupMembership = async (userId: string): Promise<{
    memberOfGroups: string[],
    teacherIds: string[]
}> => {
    try {
        // Get the player document
        const playerDocRef = getPlayerDocRef(userId);
        const playerDoc = await getDoc(playerDocRef);

        if (!playerDoc.exists()) {
            throw new Error('Player stats not found');
        }

        // Get the current memberOfGroups array
        const memberOfGroups = playerDoc.data().memberOfGroups || [];

        if (memberOfGroups.length === 0) {
            return {memberOfGroups: [], teacherIds: []};
        }

        // Fetch all groups to verify they exist and aren't deleted
        const validGroups: Group[] = [];
        const validTeacherIds: string[] = [];

        // Process groups in batches to avoid potential limitations
        const batchSize = 10;
        for (let i = 0; i < memberOfGroups.length; i += batchSize) {
            const batch = memberOfGroups.slice(i, i + batchSize);
            const groupPromises = batch.map((groupId: string) => fetchGroupById(groupId));
            const groups = await Promise.all(groupPromises);

            for (const group of groups) {
                if (group && !group.deleted) {
                    validGroups.push(group);
                    // Add the owner to teacherIds if not already included
                    if (!validTeacherIds.includes(group.ownerUid)) {
                        validTeacherIds.push(group.ownerUid);
                    }
                }
            }
        }

        // Extract valid group IDs
        const validGroupIds = validGroups.map(group => group.id);

        return {
            memberOfGroups: validGroupIds,
            teacherIds: validTeacherIds
        };
    } catch (error) {
        console.error('Error recalculating player group membership:', error);
        throw error;
    }
};

/**
 * Leave a group
 * @param groupId - Group ID
 * @param userId - User ID
 * @returns Promise that resolves when the operation is complete
 */
export const leaveGroup = async (groupId: string, userId: string): Promise<void> => {
    try {
        // Get the player stats document to update the memberOfGroups field
        const playerDocRef = getPlayerDocRef(userId);
        const playerDoc = await getDoc(playerDocRef);

        if (!playerDoc.exists()) {
            throw new Error('Player stats not found');
        }

        // Actually delete the member document from the group's members subcollection
        const memberDocRef = doc(db, 'groups', groupId, 'members', userId);
        await deleteDoc(memberDocRef);

        // First recalculate group membership and teacher IDs
        const {memberOfGroups, teacherIds} = await recalculatePlayerGroupMembership(userId);

        // Then remove the left group from the recalculated memberOfGroups array
        const updatedMemberOfGroups = memberOfGroups.filter((id: string) => id !== groupId);

        // Update the player stats document with the recalculated and filtered memberOfGroups and teacherIds
        await updateDoc(playerDocRef, {
            memberOfGroups: updatedMemberOfGroups,
            teacherIds: teacherIds,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error leaving group:', error);
        throw error;
    }
};

/**
 * Save a custom level to Firestore
 * @param user - Firebase user (author)
 * @param content - Level content in PyLevels format
 * @param filename - Filename extracted from the level
 * @returns Promise that resolves with the saved level ID
 */
export const saveCustomLevel = async (user: User, content: string, filename: string): Promise<string> => {
    if (!user) throw new Error('User must be authenticated to save a level');

    try {
        // Create a new document in the customLevels collection
        const levelsCollection = collection(db, 'customLevels');
        const levelDoc = doc(levelsCollection);
        const levelId = levelDoc.id;

        // Create the level object
        const level: CustomLevel = {
            id: levelId,
            content,
            author_id: user.uid,
            filename,
            created_at: serverTimestamp()
        };

        // Save the level to Firestore
        await setDoc(levelDoc, level);

        // Add the level to the user's levels
        await addLevelToUserLevels(user.uid, levelId, filename);

        return levelId;
    } catch (error) {
        console.error('Error saving custom level:', error);
        throw error;
    }
};

/**
 * Add a level to a user's levels
 * @param userId - User ID
 * @param levelId - Level ID
 * @param filename - Filename
 * @returns Promise that resolves when the operation is complete
 */
export const addLevelToUserLevels = async (userId: string, levelId: string, filename: string): Promise<void> => {
    try {
        // Get the userLevels document
        const userLevelsDocRef = doc(db, 'userLevels', userId);
        const userLevelsDoc = await getDoc(userLevelsDocRef);

        const userLevel: UserLevel = {
            level_id: levelId,
            filename
        };

        if (userLevelsDoc.exists()) {
            // Update existing document
            await updateDoc(userLevelsDocRef, {
                levels: arrayUnion(userLevel),
                updatedAt: serverTimestamp()
            });
        } else {
            // Create new document
            await setDoc(userLevelsDocRef, {
                levels: [userLevel],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error adding level to user levels:', error);
        throw error;
    }
};

/**
 * Get a custom level by ID
 * @param levelId - Level ID
 * @returns Promise that resolves with the level or null if not found
 */
export const getCustomLevelById = async (levelId: string): Promise<CustomLevel | null> => {
    try {
        const levelDocRef = doc(db, 'customLevels', levelId);
        const levelDoc = await getDoc(levelDocRef);

        if (levelDoc.exists()) {
            return levelDoc.data() as CustomLevel;
        }

        return null;
    } catch (error) {
        console.error('Error getting custom level by ID:', error);
        throw error;
    }
};
