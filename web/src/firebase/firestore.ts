// Firestore functions for player progress
import {doc, DocumentReference, getDoc, serverTimestamp, setDoc, updateDoc} from 'firebase/firestore';
import {db} from './index';
import {LevelId, User} from '../types';

/**
 * Get the player document reference
 * @param userId - User ID
 * @returns Firestore document reference
 */
export const getPlayerDocRef = (userId: string): DocumentReference => {
    return doc(db, 'playerStats', userId);
};

/**
 * Save solved levels to Firestore
 * @param user - Firebase user
 * @param solvedLevels - Array of solved level IDs
 * @returns Promise that resolves when the operation is complete
 */
export const saveSolvedLevels = async (user: User, solvedLevels: LevelId[]): Promise<void> => {
    if (!user) return;

    const playerDocRef = getPlayerDocRef(user.uid);

    try {
        // Check if the document exists
        const docSnap = await getDoc(playerDocRef);

        if (docSnap.exists()) {
            // Update existing document
            await updateDoc(playerDocRef, {
                'levels': solvedLevels,
                'updatedAt': serverTimestamp()
            });
        } else {
            // Create new document
            await setDoc(playerDocRef, {
                playerId: user.uid,
                displayName: user.displayName,
                email: user.email,
                levels: solvedLevels,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error saving solved levels:', error);
        throw error;
    }
};

/**
 * Load solved levels from Firestore
 * @param user - Firebase user
 * @returns Promise that resolves with the solved levels array
 */
export const loadSolvedLevels = async (user: User): Promise<LevelId[]> => {
    if (!user) return [];

    const playerDocRef = getPlayerDocRef(user.uid);

    try {
        const docSnap = await getDoc(playerDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.levels || [];
        }

        return [];
    } catch (error) {
        console.error('Error loading solved levels:', error);
        return [];
    }
};