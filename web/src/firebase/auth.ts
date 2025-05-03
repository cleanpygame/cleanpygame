// Firebase authentication functions
import {GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User} from 'firebase/auth';
import {auth} from './index';

// Create a Google Auth provider instance
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google using a popup
 * @returns Promise that resolves with the user credentials
 */
export const signInWithGoogle = async () => {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
};

/**
 * Sign out the current user
 * @returns Promise that resolves when sign out is complete
 */
export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

/**
 * Get the current authenticated user
 * @returns The current user or null if not authenticated
 */
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};