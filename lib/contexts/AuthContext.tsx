'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, getCurrentUserProfile, signOut } from '@/lib/services/authService';
import { User } from '@/lib/firebase/types';

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile from Firestore
    const fetchUserProfile = async () => {
        try {
            const response = await getCurrentUserProfile();
            if (response.success && response.data) {
                setUser(response.data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser(null);
        }
    };

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthChange(async (fbUser) => {
            setFirebaseUser(fbUser);

            if (fbUser) {
                await fetchUserProfile();
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Handle sign out
    const handleSignOut = async () => {
        try {
            await signOut();
            setUser(null);
            setFirebaseUser(null);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    // Refresh user data
    const refreshUser = async () => {
        if (firebaseUser) {
            await fetchUserProfile();
        }
    };

    const value: AuthContextType = {
        user,
        firebaseUser,
        loading,
        signOut: handleSignOut,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// HOC for protected pages
export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>
): React.FC<P> {
    return function AuthenticatedComponent(props: P) {
        const { user, loading } = useAuth();

        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-900">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        if (!user) {
            // Redirect to login or show login prompt
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-900">
                    <div className="text-center p-8 bg-gray-800 rounded-2xl">
                        <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
                        <p className="text-gray-400 mb-6">Please sign in to access this page.</p>
                        <a
                            href="/login"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Sign In
                        </a>
                    </div>
                </div>
            );
        }

        return <WrappedComponent {...props} />;
    };
}
