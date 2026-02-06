'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { StoryCard } from '@/app/share/components/StoryCard';
import { Experience } from '@/app/share/types';

export default function StoryDetailPage() {
    const params = useParams();
    const { firebaseUser: currentUser } = useAuth();
    const [story, setStory] = useState<Experience | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showComments, setShowComments] = useState(true); // Always show comments on detail page
    const [playingStoryId, setPlayingStoryId] = useState<string | null>(null);

    // Fetch Story
    useEffect(() => {
        const fetchStory = async () => {
            try {
                const id = params?.id;
                if (!id) return;

                const res = await fetch(`/api/stories/${id}`);
                const data = await res.json();

                if (data.success) {
                    // Normalize data to Experience type
                    const s = data.data;
                    const exp: Experience = {
                        id: s.id,
                        title: s.title,
                        category: s.category,
                        wasPositive: s.isPositive,
                        whatHappened: s.whatHappened,
                        whatILearned: s.whatILearned,
                        adviceForOthers: s.adviceForOthers,
                        createdAt: new Date(s.createdAt).toISOString().split('T')[0],
                        tags: s.tags || [],
                        imageUrl: s.imageUrl,
                        reactions: s.reactions || { helpful: 0, inspiring: 0, eyeOpening: 0 },
                        userReaction: null, // need to fetch separate if we want accurate user reaction state
                        comments: [], // Comments usually fetched separately or need to be included
                        commentsCount: s.commentsCount || 0,
                        views: s.views || 0,
                        status: s.status || 'published',
                        isAnonymous: s.isAnonymous,
                        authorName: s.authorName,
                        authorPhotoURL: s.authorPhotoURL,
                    };
                    setStory(exp);
                } else {
                    setError('Story not found');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load story');
            } finally {
                setLoading(false);
            }
        };

        fetchStory();
    }, [params]);

    // Handlers (Simplified versions of SharePage)
    const handleReaction = async (id: string, type: 'helpful' | 'inspiring' | 'eyeOpening') => {
        if (!currentUser) return alert('Please sign in to react');
        // Optimistic update
        setStory(prev => {
            if (!prev) return null;
            const isRemoving = prev.userReaction === type;
            const newReaction = isRemoving ? null : type;
            const newCounts = { ...prev.reactions };

            if (prev.userReaction) newCounts[prev.userReaction]--;
            if (!isRemoving) newCounts[type]++;

            return { ...prev, userReaction: newReaction, reactions: newCounts };
        });

        try {
            await fetch(`/api/stories/${id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid, type })
            });
        } catch (error) {
            console.error('Reaction failed', error);
        }
    };

    const handleAddComment = async (storyId: string, text: string, parentId?: string | null) => {
        if (!currentUser) return;
        try {
            const res = await fetch(`/api/stories/${storyId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    authorName: currentUser.displayName || 'Anonymous',
                    text,
                    parentId: parentId || null
                })
            });
            const data = await res.json();
            if (data.success) {
                // Refresh story or manually add comment to state if we had full comment tree state here
                // For simplicity, just increment count
                setStory(prev => prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : null);
            }
        } catch (error) {
            console.error('Comment failed', error);
        }
    };

    const handlePlayAudio = (exp: Experience) => {
        window.speechSynthesis.cancel();
        if (playingStoryId === exp.id) {
            setPlayingStoryId(null);
            return;
        }

        const text = `${exp.title}. ${exp.whatHappened}. What I Learned: ${exp.whatILearned}. Advice: ${exp.adviceForOthers}`;
        const utterance = new SpeechSynthesisUtterance(text);

        // Voice selection (simple fallback)
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;

        utterance.onend = () => setPlayingStoryId(null);
        setPlayingStoryId(exp.id);
        window.speechSynthesis.speak(utterance);
    };

    if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Loading...</div>;
    if (error || !story) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">{error || 'Story not found'}</div>;

    return (
        <div className="min-h-screen bg-[#0f172a] bg-gradient-to-b from-[#0f172a] to-[#1e1b4b] pb-20">
            <nav className="border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md fixed w-full z-50 top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="text-xl font-bold tracking-tight text-white/90">RethinkClub</Link>
                            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
                                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                                <Link href="/share" className="hover:text-white transition-colors">Feed</Link>
                                <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-32 max-w-3xl mx-auto px-4">
                <Link href="/share" className="text-indigo-400 mb-6 inline-block hover:underline">← Back to Feed</Link>
                <StoryCard
                    experience={story}
                    isExpanded={true}
                    currentUser={currentUser}
                    showComments={showComments}
                    onToggleExpand={() => { }}
                    onReaction={handleReaction}
                    onEdit={() => { }}
                    onDelete={() => { }}
                    onShare={() => { }}
                    onToggleComments={() => setShowComments(!showComments)}
                    onAddComment={handleAddComment}
                    isPlaying={playingStoryId === story.id}
                    onPlay={handlePlayAudio}
                />
            </div>
        </div>
    );
}
