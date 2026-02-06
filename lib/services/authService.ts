// Authentication Service - Firebase Auth operations
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    User as FirebaseUser,
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User, ApiResponse } from '../firebase/types';

const USERS_COLLECTION = 'users';

// Create or update user profile in Firestore
async function createOrUpdateUserProfile(firebaseUser: FirebaseUser): Promise<User> {
    const userRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // New user - create profile
        const userData: Omit<User, 'uid'> = {
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            createdAt: new Date(),
            updatedAt: new Date(),
            totalStories: 0,
            totalLikes: 0,
        };

        await setDoc(userRef, {
            ...userData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return { uid: firebaseUser.uid, ...userData };
    } else {
        // Existing user - update last login
        const existingData = userSnap.data();
        return {
            uid: firebaseUser.uid,
            email: existingData.email,
            displayName: existingData.displayName,
            photoURL: existingData.photoURL,
            createdAt: existingData.createdAt?.toDate() || new Date(),
            updatedAt: existingData.updatedAt?.toDate() || new Date(),
            bio: existingData.bio,
            location: existingData.location,
            website: existingData.website,
            totalStories: existingData.totalStories || 0,
            totalLikes: existingData.totalLikes || 0,
        };
    }
}

// Sign up with email and password
export async function signUpWithEmail(
    email: string,
    password: string,
    displayName: string
): Promise<ApiResponse<User>> {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update display name
        await updateProfile(userCredential.user, { displayName });

        const user = await createOrUpdateUserProfile(userCredential.user);

        return {
            success: true,
            data: user,
            message: 'Account created successfully',
        };
    } catch (err: unknown) {
        const error = err as { code?: string; message: string };
        console.error('Sign up error:', error);

        let errorMessage = 'Failed to create account';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already registered';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password should be at least 6 characters';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address';
        }

        return { success: false, error: errorMessage };
    }
}

// Sign in with email and password
export async function signInWithEmail(
    email: string,
    password: string
): Promise<ApiResponse<User>> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = await createOrUpdateUserProfile(userCredential.user);

        return {
            success: true,
            data: user,
            message: 'Signed in successfully',
        };
    } catch (err: unknown) {
        const error = err as { code?: string; message: string };
        console.error('Sign in error:', error);

        let errorMessage = 'Failed to sign in';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Invalid email or password';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
        }

        return { success: false, error: errorMessage };
    }
}

// Sign in with Google
export async function signInWithGoogle(): Promise<ApiResponse<User>> {
    try {
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        const userCredential = await signInWithPopup(auth, provider);
        const user = await createOrUpdateUserProfile(userCredential.user);

        return {
            success: true,
            data: user,
            message: 'Signed in with Google successfully',
        };
    } catch (err: unknown) {
        const error = err as { code?: string; message: string };
        console.error('Google sign in error:', error);

        let errorMessage = 'Failed to sign in with Google';
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Sign in cancelled';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Popup was blocked. Please allow popups for this site.';
        }

        return { success: false, error: errorMessage };
    }
}

// Sign out
export async function signOut(): Promise<ApiResponse<null>> {
    try {
        await firebaseSignOut(auth);
        return {
            success: true,
            message: 'Signed out successfully',
        };
    } catch (err: unknown) {
        console.error('Sign out error:', err);
        return { success: false, error: 'Failed to sign out' };
    }
}

// Send password reset email
export async function resetPassword(email: string): Promise<ApiResponse<null>> {
    try {
        await sendPasswordResetEmail(auth, email);
        return {
            success: true,
            message: 'Password reset email sent. Check your inbox.',
        };
    } catch (err: unknown) {
        const error = err as { code?: string; message: string };
        console.error('Password reset error:', error);

        let errorMessage = 'Failed to send reset email';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email';
        }

        return { success: false, error: errorMessage };
    }
}

// Get current user profile
export async function getCurrentUserProfile(): Promise<ApiResponse<User | null>> {
    try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
            return { success: true, data: null };
        }

        const user = await createOrUpdateUserProfile(currentUser);
        return { success: true, data: user };
    } catch (err: unknown) {
        console.error('Get user profile error:', err);
        return { success: false, error: 'Failed to get user profile' };
    }
}

// Update user profile
export async function updateUserProfile(
    userId: string,
    updates: Partial<Pick<User, 'displayName' | 'bio' | 'location' | 'website' | 'photoURL'>>
): Promise<ApiResponse<User>> {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);

        await updateDoc(userRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });

        // Update Firebase Auth profile if display name or photo changed
        if (auth.currentUser && (updates.displayName || updates.photoURL)) {
            await updateProfile(auth.currentUser, {
                displayName: updates.displayName || auth.currentUser.displayName,
                photoURL: updates.photoURL || auth.currentUser.photoURL,
            });
        }

        const updatedSnap = await getDoc(userRef);
        const data = updatedSnap.data();

        return {
            success: true,
            data: {
                uid: userId,
                ...data,
                createdAt: data?.createdAt?.toDate() || new Date(),
                updatedAt: data?.updatedAt?.toDate() || new Date(),
            } as User,
            message: 'Profile updated successfully',
        };
    } catch (err: unknown) {
        console.error('Update profile error:', err);
        return { success: false, error: 'Failed to update profile' };
    }
}

// Listen to auth state changes
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

// Get the current Firebase user
export function getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
}
