// TypeScript interfaces for ReThink data models

// User profile
export interface User {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    createdAt: Date;
    updatedAt: Date;
    bio?: string;
    location?: string;
    website?: string;
    totalStories: number;
    totalLikes: number;
}

// Story/Experience data
export interface Story {
    id: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;

    // Core content
    title: string;
    whatHappened: string;
    whatILearned: string;
    adviceForOthers: string;

    // Metadata
    category: 'career' | 'money' | 'health' | 'relationships' | 'personal' | 'other';
    type: 'good' | 'bad' | 'lesson';
    isPositive: boolean;
    tags: string[];
    imageUrl?: string;

    // Engagement
    likes: number; // Keeping for backward compatibility or strict likes
    reactions: {
        helpful: number;
        inspiring: number;
        eyeOpening: number;
    };
    userReaction?: 'helpful' | 'inspiring' | 'eyeOpening' | null;
    views: number;
    bookmarks: number;
    commentsCount: number;

    // Recording data (optional)
    audioUrl?: string;
    transcription?: string;
    recordingDuration?: number;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;

    // Status
    status: 'draft' | 'published' | 'archived';
    isAnonymous: boolean;
}

// Comment on a story
export interface Comment {
    id: string;
    storyId: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    likes: number;
    parentId?: string; // For nested comments/replies
}

// User interaction tracking
export interface UserInteraction {
    id: string;
    userId: string;
    storyId: string;
    type: 'like' | 'bookmark' | 'view';
    createdAt: Date;
}

// Story creation input (from form)
export interface CreateStoryInput {
    title: string;
    whatHappened: string;
    whatILearned: string;
    adviceForOthers: string;
    category: Story['category'];
    type: Story['type'];
    isPositive: boolean;
    tags: string[];
    imageUrl?: string;
    audioUrl?: string;
    transcription?: string;
    recordingDuration?: number;
    isAnonymous?: boolean;
    status?: 'draft' | 'published';
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    nextCursor?: string;
    hasMore: boolean;
    total: number;
}
