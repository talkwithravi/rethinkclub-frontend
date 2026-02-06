import React, { useState } from 'react';
import { CATEGORIES } from '../constants';
import { AI_WRITING_TIPS } from '../utils';
import { EnhanceMode } from '../types';

interface StoryFormData {
    title: string;
    category: string;
    wasPositive: boolean;
    whatHappened: string;
    whatILearned: string;
    adviceForOthers: string;
    tags: string[];
    newTag: string;
    imageUrl: string;
    isAnonymous: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

interface StoryFormProps {
    formData: StoryFormData;
    setFormData: (data: StoryFormData) => void;
    onSubmit: (status: 'draft' | 'published') => Promise<void> | void;
    onCancel: () => void;
    isSubmitting: boolean;
    // AI Props
    activeField: string | null;
    setActiveField: (field: string | null) => void;
    showAIAssistant: boolean;
    aiSuggestion: string;
    onEnhance: (text: string, field: string, mode: EnhanceMode) => Promise<string>;
    aiSuggestedTags: string[];
}

export const StoryForm: React.FC<StoryFormProps> = ({
    formData,
    setFormData,
    onSubmit,
    onCancel,
    isSubmitting,
    activeField,
    setActiveField,
    showAIAssistant,
    aiSuggestion,
    onEnhance,
    aiSuggestedTags
}) => {
    const [newTag, setNewTag] = useState('');
    const [showEnhanceMenu, setShowEnhanceMenu] = useState<string | null>(null);

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            e.preventDefault(); // Prevent form submission
            if (!formData.tags.includes(newTag.trim())) {
                setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
            }
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData({ ...formData, tags: formData.tags.filter((tag: string) => tag !== tagToRemove) });
    };

    const handleEnhance = async (field: string, mode: EnhanceMode) => {
        const text = formData[field];
        if (!text) return;
        const enhanced = await onEnhance(text, field, mode);
        setFormData({ ...formData, [field]: enhanced });
        setShowEnhanceMenu(null);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-fade-in relative overflow-hidden">

            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                ✍️ Write Your Story
            </h2>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6 relative z-10">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            onFocus={() => setActiveField('title')}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Give your experience a memorable title..."
                        />
                        {/* AI Button */}
                        <button
                            type="button"
                            onClick={() => setShowEnhanceMenu(showEnhanceMenu === 'title' ? null : 'title')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-purple-400 hover:bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Enhance with AI"
                        >
                            ✨
                        </button>
                    </div>
                </div>

                {/* Category Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, category: cat.id })}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.category === cat.id ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                            >
                                <span className="text-2xl">{cat.emoji}</span>
                                <span className="text-xs font-medium">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Fields */}
                {['whatHappened', 'whatILearned', 'adviceForOthers'].map((field) => (
                    <div key={field} className="relative group">
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-sm font-medium text-gray-300">
                                {field === 'whatHappened' ? 'What Happened?' : field === 'whatILearned' ? 'What I Learned' : 'Advice for Others'}
                            </label>
                            {showEnhanceMenu === field && (
                                <div className="absolute right-0 top-8 z-20 bg-gray-800 border border-white/10 rounded-xl shadow-xl p-1 flex gap-1">
                                    {(['grammar', 'clarity', 'engaging', 'expand'] as EnhanceMode[]).map(mode => (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => handleEnhance(field, mode)}
                                            className="px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10 rounded-lg capitalize"
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <textarea
                                value={formData[field]}
                                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                onFocus={() => setActiveField(field)}
                                rows={field === 'whatHappened' ? 6 : 4}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                placeholder={field === 'whatHappened' ? 'Share your story...' : field === 'whatILearned' ? 'The key takeaway...' : 'Tips for others...'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowEnhanceMenu(showEnhanceMenu === field ? null : field)}
                                className="absolute right-3 top-3 p-1.5 rounded-lg text-purple-400 hover:bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ✨
                            </button>
                        </div>
                        {/* Writing Tips */}
                        {showAIAssistant && activeField === field && (
                            <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-indigo-300">💡 AI Writing Tips</span>
                                    {aiSuggestion && (
                                        <button type="button" onClick={() => setFormData({ ...formData, [field]: formData[field] + (formData[field] ? ' ' : '') + aiSuggestion })} className="text-xs text-indigo-400 hover:text-indigo-300">
                                            + Insert Suggestion
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {AI_WRITING_TIPS[field]?.tips.map((tip, i) => (
                                        <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">{tip}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2 p-2 bg-white/5 border border-white/10 rounded-xl min-h-[50px]">
                        {formData.tags.map((tag: string) => (
                            <span key={tag} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm flex items-center gap-1">
                                #{tag}
                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">×</button>
                            </span>
                        ))}
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={handleAddTag}
                            className="bg-transparent border-none focus:outline-none text-white text-sm min-w-[100px]"
                            placeholder="Add tag..."
                        />
                    </div>
                    {/* Suggested Tags */}
                    {aiSuggestedTags.length > 0 && (
                        <div className="flex gap-2 text-xs text-gray-500">
                            Suggested:
                            {aiSuggestedTags.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => !formData.tags.includes(tag) && setFormData({ ...formData, tags: [...formData.tags, tag] })}
                                    className="text-indigo-400 hover:text-indigo-300"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    )}

                </div>

                {/* Anonymous Checkbox */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isAnonymous"
                        checked={formData.isAnonymous || false}
                        onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isAnonymous" className="text-sm font-medium text-gray-300 cursor-pointer select-none">
                        Post Anonymously (Hide my name and photo)
                    </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={() => onSubmit('draft')}
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        💾 Save Draft
                    </button>
                    <button
                        type="button"
                        onClick={() => onSubmit('published')}
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? 'Publishing...' : '🚀 Publish Story'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};
