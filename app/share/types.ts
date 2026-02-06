export interface Comment {
    id: string;
    author: string;
    text: string;
    createdAt: string;
    parentId?: string | null;
}

export interface Experience {
    id: string;
    title: string;
    category: string;
    wasPositive: boolean;
    whatHappened: string;
    whatILearned: string;
    adviceForOthers: string;
    createdAt: string;
    tags: string[];
    imageUrl?: string;
    reactions: { helpful: number; inspiring: number; eyeOpening: number };
    userReaction?: 'helpful' | 'inspiring' | 'eyeOpening' | null;
    comments: Comment[];
    commentsCount: number;
    views: number;
    status?: 'draft' | 'published';
    isAnonymous?: boolean;
    authorName?: string;
    authorPhotoURL?: string;
}
export type EnhanceMode = 'expand' | 'grammar' | 'clarity' | 'engaging' | 'all';
