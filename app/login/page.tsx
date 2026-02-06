'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    resetPassword
} from '@/lib/services/authService';

export default function LoginPage() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [isResetPassword, setIsResetPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (isSignUp) {
            // Validate sign up
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                setIsLoading(false);
                return;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                setIsLoading(false);
                return;
            }
            if (!formData.displayName.trim()) {
                setError('Please enter your name');
                setIsLoading(false);
                return;
            }

            const result = await signUpWithEmail(
                formData.email,
                formData.password,
                formData.displayName
            );

            if (result.success) {
                router.push('/share');
            } else {
                setError(result.error || 'Failed to create account');
            }
        } else {
            const result = await signInWithEmail(formData.email, formData.password);

            if (result.success) {
                router.push('/share');
            } else {
                setError(result.error || 'Failed to sign in');
            }
        }

        setIsLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');

        const result = await signInWithGoogle();

        if (result.success) {
            router.push('/share');
        } else {
            setError(result.error || 'Failed to sign in with Google');
        }

        setIsLoading(false);
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        const result = await resetPassword(formData.email);

        if (result.success) {
            setSuccess(result.message || 'Password reset email sent!');
        } else {
            setError(result.error || 'Failed to send reset email');
        }

        setIsLoading(false);
    };

    if (isResetPassword) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <span className="text-3xl">🔄</span>
                            <span className="text-2xl font-bold text-white">ReThink</span>
                        </Link>
                    </div>

                    {/* Reset Password Card */}
                    <div className="bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-2 text-center">
                            Reset Password
                        </h2>
                        <p className="text-gray-400 text-center mb-6">
                            Enter your email and we&apos;ll send you a reset link
                        </p>

                        <form onSubmit={handlePasswordReset} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                                    {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setIsResetPassword(false)}
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                            >
                                ← Back to Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <span className="text-3xl">🔄</span>
                        <span className="text-2xl font-bold text-white">ReThink</span>
                    </Link>
                    <p className="text-gray-400 mt-2">
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                    {/* Toggle Tabs */}
                    <div className="flex rounded-xl bg-gray-900/60 p-1 mb-6">
                        <button
                            onClick={() => { setIsSignUp(false); setError(''); }}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${!isSignUp
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setIsSignUp(true); setError(''); }}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${isSignUp
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-3 bg-white text-gray-800 font-medium rounded-xl hover:bg-gray-100 transition-all shadow-lg disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-gray-700"></div>
                        <span className="text-gray-500 text-sm">or</span>
                        <div className="flex-1 h-px bg-gray-700"></div>
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-900/60 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {!isSignUp && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => setIsResetPassword(true)}
                                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                                </span>
                            ) : (
                                isSignUp ? 'Create Account' : 'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Terms */}
                    {isSignUp && (
                        <p className="mt-6 text-center text-gray-500 text-xs">
                            By signing up, you agree to our{' '}
                            <Link href="/terms" className="text-blue-400 hover:underline">Terms of Service</Link>
                            {' '}and{' '}
                            <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
                        </p>
                    )}
                </div>

                {/* Back Link */}
                <div className="mt-6 text-center">
                    <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
