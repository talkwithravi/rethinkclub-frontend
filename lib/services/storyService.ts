// Story Service - Firebase Firestore operations for stories
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    increment,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Story, CreateStoryInput, PaginatedResponse, ApiResponse } from '../firebase/types';

const STORIES_COLLECTION = 'stories';
const PAGE_SIZE = 10;

// Helper to convert Firestore timestamp to Date
// Helper to convert Firestore timestamp to Date
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertTimestamps = (data: any): Story => ({
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    publishedAt: data.publishedAt?.toDate?.() || null,
});

// Create a new story
export async function createStory(
    userId: string,
    userName: string,
    userPhotoURL: string | undefined,
    input: CreateStoryInput
): Promise<ApiResponse<Story>> {
    try {
        const storyData = {
            authorId: userId,
            authorName: input.isAnonymous ? 'Anonymous' : userName,
            authorPhotoURL: input.isAnonymous ? null : userPhotoURL,

            // Content
            title: input.title,
            whatHappened: input.whatHappened,
            whatILearned: input.whatILearned,
            adviceForOthers: input.adviceForOthers,

            // Metadata
            category: input.category,
            type: input.type,
            isPositive: input.isPositive,
            tags: input.tags,
            imageUrl: input.imageUrl || null,

            // Recording
            audioUrl: input.audioUrl || null,
            transcription: input.transcription || null,
            recordingDuration: input.recordingDuration || null,

            // Engagement (start at 0)
            likes: 0,
            views: 0,
            bookmarks: 0,
            commentsCount: 0,

            // Status
            status: 'published' as const,
            isAnonymous: input.isAnonymous || false,

            // Timestamps
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            publishedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, STORIES_COLLECTION), storyData);

        return {
            success: true,
            data: {
                id: docRef.id,
                ...storyData,
                createdAt: new Date(),
                updatedAt: new Date(),
                publishedAt: new Date(),
            } as Story,
            message: 'Story created successfully',
        };
    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error creating story:', error);
        return {
            success: false,
            error: error.message || 'Failed to create story',
        };
    }
}

// Get a single story by ID
export async function getStory(storyId: string): Promise<ApiResponse<Story>> {
    try {
        const docRef = doc(db, STORIES_COLLECTION, storyId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return {
                success: false,
                error: 'Story not found',
            };
        }

        // Increment view count
        await updateDoc(docRef, {
            views: increment(1),
        });

        return {
            success: true,
            data: convertTimestamps({ id: docSnap.id, ...docSnap.data() }),
        };
    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error fetching story:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch story',
        };
    }
}

// Get paginated stories with filters
export async function getStories(options: {
    category?: string;
    type?: string;
    authorId?: string;
    tag?: string;
    cursor?: string;
    pageSize?: number;
}): Promise<PaginatedResponse<Story>> {
    try {
        const {
            category,
            type,
            authorId,
            tag,
            cursor,
            pageSize = PAGE_SIZE,
        } = options;

        let q = query(
            collection(db, STORIES_COLLECTION),
            where('status', '==', 'published'),
            orderBy('createdAt', 'desc'),
            limit(pageSize + 1) // Get one extra to check if there are more
        );

        // Apply filters
        if (category) {
            q = query(q, where('category', '==', category));
        }
        if (type) {
            q = query(q, where('type', '==', type));
        }
        if (authorId) {
            q = query(q, where('authorId', '==', authorId));
        }
        if (tag) {
            q = query(q, where('tags', 'array-contains', tag));
        }

        // Apply cursor for pagination
        if (cursor) {
            const cursorDoc = await getDoc(doc(db, STORIES_COLLECTION, cursor));
            if (cursorDoc.exists()) {
                q = query(q, startAfter(cursorDoc));
            }
        }

        const querySnapshot = await getDocs(q);
        const stories: Story[] = [];

        querySnapshot.forEach((doc) => {
            stories.push(convertTimestamps({ id: doc.id, ...doc.data() }));
        });

        // Check if there are more results
        const hasMore = stories.length > pageSize;
        if (hasMore) {
            stories.pop(); // Remove the extra item
        }

        return {
            items: stories,
            nextCursor: hasMore ? stories[stories.length - 1]?.id : undefined,
            hasMore,
            total: stories.length,
        };
    } catch (err: unknown) {
        console.error('Error fetching stories:', err);
        return {
            items: [],
            hasMore: false,
            total: 0,
        };
    }
}

// Update a story
export async function updateStory(
    storyId: string,
    userId: string,
    updates: Partial<CreateStoryInput>
): Promise<ApiResponse<Story>> {
    try {
        const docRef = doc(db, STORIES_COLLECTION, storyId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: false, error: 'Story not found' };
        }

        const storyData = docSnap.data();
        if (storyData.authorId !== userId) {
            return { success: false, error: 'Unauthorized to update this story' };
        }

        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });

        const updatedDoc = await getDoc(docRef);
        return {
            success: true,
            data: convertTimestamps({ id: updatedDoc.id, ...updatedDoc.data() }),
            message: 'Story updated successfully',
        };
    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error updating story:', error);
        return { success: false, error: error.message || 'Failed to update story' };
    }
}

// Delete a story
export async function deleteStory(
    storyId: string,
    userId: string
): Promise<ApiResponse<null>> {
    try {
        const docRef = doc(db, STORIES_COLLECTION, storyId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: false, error: 'Story not found' };
        }

        const storyData = docSnap.data();
        if (storyData.authorId !== userId) {
            return { success: false, error: 'Unauthorized to delete this story' };
        }

        await deleteDoc(docRef);
        return {
            success: true,
            message: 'Story deleted successfully',
        };
    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error deleting story:', error);
        return { success: false, error: error.message || 'Failed to delete story' };
    }
}

// Like a story
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function likeStory(storyId: string, userId: string): Promise<ApiResponse<number>> {
    try {
        const docRef = doc(db, STORIES_COLLECTION, storyId);

        // TODO: Check if user already liked (using subcollection or separate collection)

        await updateDoc(docRef, {
            likes: increment(1),
        });

        const updatedDoc = await getDoc(docRef);
        return {
            success: true,
            data: updatedDoc.data()?.likes || 0,
        };
    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error liking story:', error);
        return { success: false, error: error.message || 'Failed to like story' };
    }
}

// Bookmark a story
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function bookmarkStory(storyId: string, userId: string): Promise<ApiResponse<number>> {
    try {
        const docRef = doc(db, STORIES_COLLECTION, storyId);

        await updateDoc(docRef, {
            bookmarks: increment(1),
        });

        const updatedDoc = await getDoc(docRef);
        return {
            success: true,
            data: updatedDoc.data()?.bookmarks || 0,
        };
    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error bookmarking story:', error);
        return { success: false, error: error.message || 'Failed to bookmark story' };
    }
}
