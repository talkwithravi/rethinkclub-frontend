import React, { useState } from 'react';


interface Comment {
    id: string;
    author: string;
    text: string;
    createdAt: string;
    parentId?: string | null;
}

interface CommentSectionProps {
    storyId: string;
    comments: Comment[];

    onAddComment: (storyId: string, text: string, parentId?: string | null) => Promise<void>;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
    storyId,
    comments = [],
    onAddComment
}) => {
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (parentId: string | null = null) => {
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            await onAddComment(storyId, newComment, parentId);
            setNewComment('');
            setReplyingTo(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-gray-300 mb-3">
                Comments ({comments?.length || 0})
            </h4>

            <div className="space-y-4 mb-6">
                {/* Render Root Comments */}
                {comments?.filter(c => !c.parentId).map(comment => {
                    const replies = comments?.filter(r => r.parentId === comment.id) || [];

                    return (
                        <div key={comment.id} className="space-y-2">
                            {/* Parent Comment */}
                            <div className="bg-white/5 rounded-xl p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-indigo-300">{comment.author}</span>
                                        <span className="text-xs text-gray-500">{comment.createdAt}</span>
                                    </div>
                                    <button
                                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                        className="text-xs text-gray-400 hover:text-white"
                                    >
                                        Reply
                                    </button>
                                </div>
                                <p className="text-sm text-gray-300">{comment.text}</p>
                            </div>

                            {/* Reply Input */}
                            {replyingTo === comment.id && (
                                <div className="ml-4 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder={`Reply to ${comment.author}...`}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit(comment.id)}
                                        autoFocus
                                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <button
                                        onClick={() => handleSubmit(comment.id)}
                                        disabled={isSubmitting}
                                        className="px-3 py-2 bg-indigo-500 rounded-lg text-white text-xs whitespace-nowrap disabled:opacity-50"
                                    >
                                        Reply
                                    </button>
                                </div>
                            )}

                            {/* Replies */}
                            {replies.length > 0 && (
                                <div className="ml-4 space-y-2 pl-2 border-l border-white/10">
                                    {replies.map(reply => (
                                        <div key={reply.id} className="bg-white/[0.02] rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium text-purple-300">{reply.author}</span>
                                                <span className="text-[10px] text-gray-500">{reply.createdAt}</span>
                                            </div>
                                            <p className="text-xs text-gray-300">{reply.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Main Comment Input */}
            <div className="flex gap-2 sticky bottom-0 bg-[#0f172a] pt-2 pb-1">
                <input
                    type="text"
                    placeholder="Add a comment..."
                    value={replyingTo ? '' : newComment} // Clear main input if replying
                    onChange={(e) => {
                        if (replyingTo) setReplyingTo(null); // Switch back to main comment
                        setNewComment(e.target.value);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && !replyingTo && handleSubmit()}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    disabled={!!replyingTo || isSubmitting}
                />
                <button
                    onClick={() => handleSubmit()}
                    disabled={!!replyingTo || isSubmitting}
                    className="px-4 py-2 bg-indigo-500 rounded-xl text-white text-sm hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </div>
            {replyingTo && (
                <div className="text-xs text-gray-500 mt-1">
                    Replying to a specific comment... <button onClick={() => setReplyingTo(null)} className="text-indigo-400 hover:underline">Cancel</button>
                </div>
            )}
        </div>
    );
};
