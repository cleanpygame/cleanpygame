// Firestore functions for player progress
import {doc, DocumentReference, getDoc, serverTimestamp, setDoc, updateDoc} from 'firebase/firestore';
import {db} from './index';
import {PlayerStatsState, User} from '../types';
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
