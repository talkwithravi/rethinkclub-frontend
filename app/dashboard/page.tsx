'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthChange } from '@/lib/services/authService';
import { User as FirebaseUser } from 'firebase/auth';
import { StoryCard } from '../share/components/StoryCard';
import { Experience } from '../share/types';

export default function DashboardPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [myStories, setMyStories] = useState<Experience[]>([]);
    const [stats, setStats] = useState({
        totalStories: 0,
        totalLikes: 0,
        totalViews: 0
    });

    // Audio State
    const [playingStoryId, setPlayingStoryId] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeUtteranceRef = React.useRef<any>(null);

    const fetchMyStories = async (uid: string) => {
        try {
            // Fetch MY stories (including drafts)
            const response = await fetch(`/api/stories?authorId=${uid}&pageSize=50&viewingUserId=${uid}`);
            const data = await response.json();

            if (data.items) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const stories: Experience[] = data.items.map((story: any) => ({
                    id: story.id,
                    title: story.title,
                    category: story.category,
                    wasPositive: story.isPositive,
                    whatHappened: story.whatHappened,
                    whatILearned: story.whatILearned,
                    adviceForOthers: story.adviceForOthers,
                    createdAt: new Date(story.createdAt).toISOString().split('T')[0],
                    tags: story.tags || [],
                    imageUrl: story.imageUrl,
                    reactions: story.reactions || { helpful: 0, inspiring: 0, eyeOpening: 0 },
                    userReaction: story.userReaction || null,
                    comments: [],
                    commentsCount: story.commentsCount || 0,
                    views: story.views || 0,
                    status: story.status || 'published',
                    isAnonymous: story.isAnonymous,
                    authorName: story.authorName,
                    authorPhotoURL: story.authorPhotoURL,
                }));
                setMyStories(stories);

                // Calculate stats
                const totalLikes = stories.reduce((acc, s) => acc + (s.reactions?.helpful || 0) + (s.reactions?.inspiring || 0) + (s.reactions?.eyeOpening || 0), 0);
                const totalViews = stories.reduce((acc, s) => acc + (s.views || 0), 0);
                setStats({
                    totalStories: stories.length,
                    totalLikes,
                    totalViews
                });
            }
        } catch (error) {
            console.error('Failed to fetch my stories', error);
        }
    };

    // Auth Check
    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            if (!user) {
                router.push('/login');
            } else {
                setCurrentUser(user);
                fetchMyStories(user.uid);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    const handlePlayAudio = (story: Experience) => {
        window.speechSynthesis.cancel();
        if (playingStoryId === story.id) {
            setPlayingStoryId(null);
            return;
        }

        const text = `${story.title}. ${story.whatHappened}. What I Learned: ${story.whatILearned}. Advice: ${story.adviceForOthers}`;
        const utterance = new SpeechSynthesisUtterance(text);

        // Voice selection logic (copied from SharePage for consistency)
        const voices = window.speechSynthesis.getVoices();
        const preferredVoices = ['Google US English', 'Samantha', 'Daniel', 'Microsoft Aria Online (Natural) - English (United States)'];
        const selectedVoice = voices.find(v => preferredVoices.some(p => v.name.includes(p))) || voices.find(v => v.lang.startsWith('en'));
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.rate = 0.9;

        utterance.onend = () => {
            setPlayingStoryId(null);
            activeUtteranceRef.current = null;
        };

        setPlayingStoryId(story.id);
        activeUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#0f172a] bg-gradient-to-b from-[#0f172a] to-[#1e1b4b] text-white">
            {/* Navbar */}
            <nav className="border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md fixed w-full z-50 top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="text-xl font-bold tracking-tight text-white/90">RethinkClub</Link>
                            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
                                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                                <Link href="/share" className="hover:text-white transition-colors">Feed</Link>
                                <Link href="/dashboard" className="text-white font-semibold">Dashboard</Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                                    {currentUser?.displayName?.[0] || currentUser?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="hidden md:inline text-sm font-medium">{currentUser?.displayName || 'User'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-12 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl ring-4 ring-white/10">
                            {currentUser?.displayName?.[0] || currentUser?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl font-bold mb-2">{currentUser?.displayName || 'Community Member'}</h1>
                            <p className="text-gray-400">{currentUser?.email}</p>
                            <div className="flex gap-2 mt-4 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-gray-300">Member</span>
                                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">Active</span>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="flex gap-4">
                            <div className="bg-black/20 p-4 rounded-2xl text-center min-w-[100px]">
                                <div className="text-2xl font-bold text-white">{stats.totalStories}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider">Stories</div>
                            </div>
                            <div className="bg-black/20 p-4 rounded-2xl text-center min-w-[100px]">
                                <div className="text-2xl font-bold text-white">{stats.totalLikes}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider">Impact</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Stories Section */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white">My Stories</h2>
                        <Link href="/share" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg flex items-center gap-2">
                            <span>✏️</span> Write New Story
                        </Link>
                    </div>

                    {myStories.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myStories.map(story => (
                                <StoryCard
                                    key={story.id}
                                    experience={story}
                                    isExpanded={false}
                                    currentUser={currentUser}
                                    showComments={false}
                                    onReaction={() => { }}
                                    onEdit={() => { }}
                                    onDelete={() => { }}
                                    onToggleExpand={() => { }}
                                    onShare={() => { }}
                                    onToggleComments={() => { }}
                                    onAddComment={async () => { }}
                                    isPlaying={playingStoryId === story.id}
                                    onPlay={handlePlayAudio}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
                            <div className="text-4xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-white mb-2">No stories yet</h3>
                            <p className="text-gray-400 mb-6 max-w-sm mx-auto">Start sharing your journey to track your impact and connect with others.</p>
                            <Link href="/share" className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all">
                                Create Your First Story
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
