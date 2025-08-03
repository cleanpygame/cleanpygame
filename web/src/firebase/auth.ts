// Firebase authentication functions
import {
    GoogleAuthProvider,
    linkWithPopup,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    signInAnonymously as firebaseSignInAnonymously,
    signInWithPopup,
    signOut as firebaseSignOut,
    updateProfile,
    User
} from 'firebase/auth';
import {auth} from './index';

// Create a Google Auth provider instance
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google using a popup
 * @returns Promise that resolves with the user credentials and a flag indicating if the user was linked
 */
export const signInWithGoogle = async () => {
    try {
        const result = await linkWithPopup(auth.currentUser!, googleProvider);
        //await result.user.reload();
        const providerDisplayName = result.user.providerData[0].displayName;

        if (providerDisplayName) {
            await updateProfile(result.user, {displayName: providerDisplayName});
            await result.user.reload();
        }
        console.log("link Result", result.user)
        return {
            user: result.user,
            wasLinked: true
        };
    } catch (error: any) {
        if (error.code === 'auth/account-exists-with-different-credential' ||
            error.code === 'auth/credential-already-in-use') {
            await firebaseSignOut(auth);
            const result = await signInWithPopup(auth, googleProvider);
            console.log("singIn Result", result)

            return {
                user: result.user,
                wasLinked: false,
                anonymousProgressDiscarded: true
            };
        }
        console.error('Error linking anonymous account:', error);
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

/**
 * Set up an auth state change listener
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
    return firebaseOnAuthStateChanged(auth, callback);
};

/**
 * Sign in anonymously
 * @returns Promise that resolves with the user credentials
 */
export const signInAnonymously = async () => {
    try {
        return await firebaseSignInAnonymously(auth);
    } catch (error) {
        console.error('Error signing in anonymously:', error);
        throw error;
    }
};