import React, { useState } from 'react';
import Image from 'next/image';
import { User } from 'firebase/auth';
import { Experience } from '../types';
import { getCategoryInfo } from '../constants';
import { CommentSection } from './CommentSection';

interface StoryCardProps {
    experience: Experience;
    isExpanded: boolean;
    currentUser: User | null;
    showComments: boolean;
    onToggleExpand: (id: string) => void;
    onReaction: (id: string, type: 'helpful' | 'inspiring' | 'eyeOpening') => void;
    onEdit: (exp: Experience) => void;
    onDelete: (id: string) => void;
    onShare: (exp: Experience, platform: string) => void;
    onToggleComments: (id: string) => void;
    onAddComment: (storyId: string, text: string, parentId?: string | null) => Promise<void>;
    isPlaying: boolean;
    onPlay: (exp: Experience) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
    experience: exp,
    isExpanded,
    currentUser,
    showComments,
    onToggleExpand,
    onReaction,
    onEdit,
    onDelete,
    onShare,
    onToggleComments,
    onAddComment,
    isPlaying,
    onPlay
}) => {
    const category = getCategoryInfo(exp.category);
    const [showShareMenu, setShowShareMenu] = useState(false);

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPlay(exp);
    };

    return (
        <div
            className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl transition-all duration-300 group overflow-hidden shadow-lg hover:shadow-xl hover:bg-white/[0.07] ${isExpanded ? 'border-indigo-500/30 shadow-indigo-500/10' : 'hover:border-indigo-500/20'}`}
        >
            {/* Image if exists */}
            {exp.imageUrl && (
                <div className="h-48 overflow-hidden relative">
                    <Image
                        src={exp.imageUrl}
                        alt={exp.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            )}

            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Category Badge */}
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 cursor-pointer"
                        style={{ backgroundColor: `${category.color}20` }}
                        onClick={() => onToggleExpand(exp.id)}
                    >
                        {category.emoji}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                                <h3
                                    className="text-lg font-bold text-white truncate cursor-pointer hover:text-indigo-400 transition-colors"
                                    onClick={() => onToggleExpand(exp.id)}
                                >
                                    {exp.title}
                                </h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${exp.wasPositive ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {exp.wasPositive ? '✅' : '💡'}
                                </span>
                                {exp.status === 'draft' && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                                        Draft
                                    </span>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className={`flex gap-1 transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                {/* Listen Button */}
                                <button
                                    onClick={handleSpeak}
                                    className={`p-2 rounded-lg hover:bg-gray-100 transition-all ${isPlaying ? 'text-green-600 animate-pulse' : 'text-gray-400 hover:text-indigo-600'}`}
                                    title={isPlaying ? "Stop Listening" : "Listen to Story"}
                                >
                                    {isPlaying ? '🔊' : '▶️'}
                                </button>

                                {currentUser && (
                                    <>
                                        <button onClick={() => onEdit(exp)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-all" title="Edit">✏️</button>
                                        <button onClick={() => onDelete(exp.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all" title="Delete">🗑️</button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Author Info */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border border-white/10 relative">
                                {exp.isAnonymous ? (
                                    <span className="text-xs">🕵️</span>
                                ) : exp.authorPhotoURL ? (
                                    <Image
                                        src={exp.authorPhotoURL}
                                        alt={exp.authorName || 'User'}
                                        fill
                                        className="object-cover"
                                        sizes="20px"
                                    />
                                ) : (
                                    <span className="text-[10px] text-gray-400 font-bold">{exp.authorName?.[0] || 'U'}</span>
                                )}
                            </div>
                            <span className="text-xs text-gray-400">{exp.isAnonymous ? 'Anonymous' : exp.authorName || 'Anonymous'}</span>
                        </div>

                        <p className={`text-gray-300 text-sm mb-3 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {exp.whatHappened}
                        </p>

                        {/* Tags */}
                        {exp.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {exp.tags.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Expanded Details */}
                        {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                {exp.whatILearned && (
                                    <div>
                                        <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">🧠 What I Learned</div>
                                        <p className="text-gray-700 text-sm">{exp.whatILearned}</p>
                                    </div>
                                )}
                                {exp.adviceForOthers && (
                                    <div>
                                        <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">💬 Advice for Others</div>
                                        <p className="text-gray-700 text-sm">{exp.adviceForOthers}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reactions & Stats Bar */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            {/* Reactions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onReaction(exp.id, 'helpful')}
                                    className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1 transition-all ${exp.userReaction === 'helpful' ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    👍 {exp.reactions.helpful}
                                </button>
                                <button
                                    onClick={() => onReaction(exp.id, 'inspiring')}
                                    className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1 transition-all ${exp.userReaction === 'inspiring' ? 'bg-pink-100 text-pink-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    ❤️ {exp.reactions.inspiring}
                                </button>
                                <button
                                    onClick={() => onReaction(exp.id, 'eyeOpening')}
                                    className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1 transition-all ${exp.userReaction === 'eyeOpening' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    💡 {exp.reactions.eyeOpening}
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{exp.views.toLocaleString()} views</span>
                                <button
                                    onClick={() => onToggleComments(exp.id)}
                                    className="px-3 py-1.5 rounded-full text-xs bg-gray-50 text-gray-500 hover:bg-gray-100 flex items-center gap-1"
                                >
                                    💬 {exp.commentsCount || exp.comments?.length || 0}
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowShareMenu(!showShareMenu)}
                                        className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-gray-400 hover:bg-white/10"
                                    >
                                        📤 Share
                                    </button>
                                    {showShareMenu && (
                                        <div className="absolute right-0 bottom-full mb-2 bg-white border border-gray-100 rounded-xl overflow-hidden z-10 shadow-xl w-32">
                                            <button onClick={() => { onShare(exp, 'twitter'); setShowShareMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                                🐦 Twitter
                                            </button>
                                            <button onClick={() => { onShare(exp, 'linkedin'); setShowShareMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                                💼 LinkedIn
                                            </button>
                                            <button onClick={() => { onShare(exp, 'copy'); setShowShareMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                                📋 Copy
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        {showComments && (
                            <CommentSection
                                storyId={exp.id}
                                comments={exp.comments}
                                onAddComment={onAddComment}
                            />
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-400">{exp.createdAt}</span>
                            <button
                                onClick={() => onToggleExpand(exp.id)}
                                className="text-xs text-indigo-500 font-medium hover:text-indigo-600 transition-colors"
                            >
                                {isExpanded ? '↑ Show Less' : '↓ Read More'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
