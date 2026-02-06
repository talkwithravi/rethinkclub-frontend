'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function LandingPage() {
    const { user, firebaseUser } = useAuth();
    const [stats, setStats] = React.useState<{
        members: number;
        discussions: number;
        comments: number;
        activeToday: number;
        categories?: Record<string, number>;
    }>({
        members: 0,
        discussions: 0,
        comments: 0,
        activeToday: 0,
        categories: {}
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [featuredStories, setFeaturedStories] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch stats
                const statsRes = await fetch('/api/stats', { cache: 'no-store' });
                const statsData = await statsRes.json();
                if (statsData.success) {
                    setStats(statsData.data);
                }

                // Fetch featured stories (latest published)
                const storiesRes = await fetch('/api/stories?pageSize=3');
                const storiesData = await storiesRes.json();
                if (storiesData.items) {
                    setFeaturedStories(storiesData.items);
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const displayStats = [
        { label: 'Community Members', value: stats.members.toLocaleString() },
        { label: 'Discussions', value: stats.discussions.toLocaleString() },
        { label: 'Comments', value: stats.comments.toLocaleString() },
        { label: 'Active Today', value: stats.activeToday.toLocaleString(), color: 'text-orange-500' },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] bg-gradient-to-b from-[#0f172a] to-[#1e1b4b] text-gray-200">
            {/* Navbar */}
            <nav className="border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md fixed w-full z-50 top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="text-xl font-bold tracking-tight text-white/90">
                                RethinkClub
                            </Link>
                            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
                                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                                <a href="#topics" className="hover:text-white transition-colors">Topics</a>
                                <Link href="/share" className="hover:text-white transition-colors">Feed</Link>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-4">
                            {/* Search Bar Placeholder */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search discussions..."
                                    className="pl-9 pr-4 py-1.5 bg-white/10 border-none rounded-full text-sm text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 w-64"
                                />
                                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>

                            {firebaseUser ? (
                                <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium hover:text-white text-gray-300">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                                        {user?.displayName?.[0] || firebaseUser.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden lg:inline">Dashboard</span>
                                </Link>
                            ) : (
                                <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white">Sign In</Link>
                            )}

                            <Link href="/share" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                                {firebaseUser ? 'Go to Feed' : 'Join Community'}
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
                {/* Animated Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 opacity-30 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                    <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
                </div>

                <div className="max-w-4xl mx-auto animate-fade-in-up">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">RethinkClub</span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        A thriving community dedicated to personal development, growth, and meaningful connections. Share your journey, learn from others, and transform your life.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/share" className="px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 hover:scale-105">
                            {firebaseUser ? 'Go to Feed' : 'Join Community'}
                        </Link>
                        <a href="#topics" className="px-8 py-4 bg-white/5 text-gray-200 border border-white/10 rounded-full font-semibold hover:bg-white/10 transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-105">
                            Explore Forums
                        </a>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white/5 py-12 border-y border-white/10 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {displayStats.map((stat, i) => (
                        <div key={i}>
                            <div className={`text-3xl md:text-4xl font-bold mb-1 ${stat.color || 'text-white'}`}>
                                {loading ? '...' : stat.value}
                            </div>
                            <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Transform your experiences into shared wisdom in three simple steps.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: '1. Speak or Write', desc: 'Use our voice recorder or text editor to share your story naturally. No pressure, just you.', icon: '🎙️' },
                            { title: '2. AI Enhancement', desc: 'Our Gemini AI polishes your story, structures your thoughts, and extracts key lessons.', icon: '✨' },
                            { title: '3. Inspire & Connect', desc: 'Publish your wisdom to the community. Spark discussions and help others grow.', icon: '🚀' }
                        ].map((step, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-3xl relative overflow-hidden group hover:bg-white/10 transition-all text-center">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
                                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{step.icon}</div>
                                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Discussion Topics */}
            <section id="topics" className="py-20 bg-transparent px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">Popular Discussion Topics</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Join conversations that matter. Connect with like-minded individuals on your personal development journey.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: 'Goal Setting', icon: '🚩', count: `${(stats.categories?.personal || 0) + (stats.categories?.life || 0)} posts` },
                            { title: 'Mindfulness', icon: '🧘', count: `${stats.categories?.health || 0} posts` },
                            { title: 'Career Growth', icon: '💼', count: `${(stats.categories?.career || 0) + (stats.categories?.work || 0)} posts` },
                            { title: 'Relationships', icon: '❤️', count: `${stats.categories?.relationships || 0} posts` },
                            { title: 'Health & Fitness', icon: '🏃', count: `${stats.categories?.health || 0} posts` },
                            { title: 'Productivity', icon: '⚡', count: `${(stats.categories?.career || 0) + (stats.categories?.work || 0)} posts` },
                            { title: 'Finance', icon: '💰', count: `${stats.categories?.money || 0} posts` },
                            { title: 'Books', icon: '📚', count: `${stats.categories?.other || 0} posts` },
                        ].map((topic, i) => (
                            <div key={i} className="bg-white/5 p-6 rounded-2xl shadow-lg border border-white/10 hover:bg-white/10 transition-all cursor-pointer group backdrop-blur-sm">
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{topic.icon}</div>
                                <h3 className="text-lg font-bold text-white mb-2">{topic.title}</h3>
                                <p className="text-sm text-gray-400">{loading ? '...' : topic.count}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Discussions */}
            <section className="py-20 bg-black/20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-12 text-center">Featured Stories</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="border border-white/10 bg-white/5 rounded-2xl p-8 animate-pulse">
                                    <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
                                    <div className="h-8 bg-white/10 rounded w-3/4 mb-3"></div>
                                    <div className="h-20 bg-white/10 rounded mb-6"></div>
                                </div>
                            ))
                        ) : featuredStories.length > 0 ? (
                            featuredStories.map((story) => (
                                <Link href={`/story/${story.id}`} key={story.id} className="block h-full">
                                    <div className="border border-white/10 bg-white/5 rounded-2xl p-8 hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all flex flex-col h-full backdrop-blur-sm cursor-pointer group">
                                        <div className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 inline-block px-3 py-1 rounded-full mb-4 w-fit capitalize">{story.category || 'General'}</div>
                                        <h3 className="text-xl font-bold text-white mb-3 leading-tight line-clamp-2 group-hover:text-indigo-400 transition-colors">{story.title}</h3>
                                        <p className="text-gray-400 mb-6 text-sm leading-relaxed line-clamp-3 flex-grow">{story.whatHappened}</p>
                                        <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] text-indigo-300 border border-indigo-500/30 overflow-hidden relative">
                                                    {story.authorPhotoURL ? (
                                                        <Image
                                                            src={story.authorPhotoURL}
                                                            alt={story.authorName || 'Author'}
                                                            fill
                                                            className="object-cover"
                                                            sizes="24px"
                                                        />
                                                    ) : (
                                                        story.authorName?.[0] || 'U'
                                                    )}
                                                </div>
                                                <span className="text-gray-400">{story.authorName || 'Anonymous'}</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <span>♥ {story.likes || 0}</span>
                                                <span>💬 {story.commentsCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-gray-500 py-10">
                                No stories shared yet. Be the first to share!
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-indigo-900/50 text-center px-4 relative overflow-hidden backdrop-blur-md">
                <div className="absolute inset-0 bg-indigo-600/10"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Share Your Wisdom</h2>
                    <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto">
                        Your experiences can light the way for someone else. Share your authentic stories, lessons, and breakthroughs.
                    </p>
                    <Link href="/share" className="px-10 py-5 bg-white text-indigo-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105 inline-flex items-center gap-2">
                        <span>✨</span> Share Your Experience
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#0f172a] text-gray-400 py-16 px-4 border-t border-white/10">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-sm">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-2xl font-bold text-white mb-6 block">RethinkClub</Link>
                        <p className="max-w-xs leading-relaxed">
                            A community dedicated to personal growth, meaningful connections, and positive change.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-6">Quick Links</h4>
                        <div className="space-y-4 flex flex-col">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <Link href="/share" className="hover:text-white transition-colors">Forums</Link>
                            <Link href="#" className="hover:text-white transition-colors">About</Link>
                            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-6">Connect</h4>
                        <div className="flex gap-4">
                            {/* Social Icons Placeholder */}
                            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">𝕏</div>
                            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer">📸</div>
                            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">in</div>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 text-center text-xs">
                    © 2026 RethinkClub. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
