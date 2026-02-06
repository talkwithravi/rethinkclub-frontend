// API Route: Create and List Stories
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { CreateStoryInput, Story, PaginatedResponse } from '@/lib/firebase/types';

// POST - Create a new story
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, userName, userPhotoURL, story } = body as {
            userId: string;
            userName: string;
            userPhotoURL?: string;
            story: CreateStoryInput;
        };

        if (!userId || !story) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = getAdminFirestore();
        const now = new Date();

        const storyData = {
            authorId: userId,
            authorName: story.isAnonymous ? 'Anonymous' : userName,
            authorPhotoURL: story.isAnonymous ? null : userPhotoURL || null,

            // Content
            title: story.title,
            whatHappened: story.whatHappened,
            whatILearned: story.whatILearned,
            adviceForOthers: story.adviceForOthers,

            // Metadata
            category: story.category,
            type: story.type,
            isPositive: story.isPositive,
            tags: story.tags || [],
            imageUrl: story.imageUrl || null,

            // Recording
            audioUrl: story.audioUrl || null,
            transcription: story.transcription || null,
            recordingDuration: story.recordingDuration || null,

            // Engagement
            likes: 0,
            reactions: {
                helpful: 0,
                inspiring: 0,
                eyeOpening: 0
            },
            views: 0,
            bookmarks: 0,
            commentsCount: 0,

            // Status
            status: story.status || 'published',
            isAnonymous: story.isAnonymous || false,

            // Timestamps
            createdAt: now,
            updatedAt: now,
            publishedAt: story.status === 'published' ? now : undefined,
        };

        const docRef = await db.collection('stories').add(storyData);

        return NextResponse.json({
            success: true,
            data: { id: docRef.id, ...storyData },
            message: 'Story created successfully',
        });

    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error creating story:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create story' },
            { status: 500 }
        );
    }
}

// GET - List stories with pagination and filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const type = searchParams.get('type');
        const authorId = searchParams.get('authorId');
        const viewingUserId = searchParams.get('viewingUserId');
        const cursor = searchParams.get('cursor');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');

        const db = getAdminFirestore();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let query: any = db.collection('stories');

        // Status filter logic
        if (authorId && viewingUserId && authorId === viewingUserId) {
            // If viewing own stories, show both published and drafts
            query = query.where('status', 'in', ['published', 'draft']);
        } else {
            // Otherwise only public stories
            query = query.where('status', '==', 'published');
        }

        query = query.limit(pageSize + 1);

        // Apply filters
        if (category) {
            query = query.where('category', '==', category);
        }
        if (type) {
            query = query.where('type', '==', type);
        }
        if (authorId) {
            query = query.where('authorId', '==', authorId);
        }

        // Apply cursor for pagination
        if (cursor) {
            const cursorDoc = await db.collection('stories').doc(cursor).get();
            if (cursorDoc.exists) {
                query = query.startAfter(cursorDoc);
            }
        }

        const snapshot = await query.get();

        // Fetch user interactions if viewingUserId is provided
        const userInteractions = new Map<string, string>();

        if (viewingUserId) {
            try {
                const interactionsSnapshot = await db.collectionGroup('interactions')
                    .where('userId', '==', viewingUserId)
                    .get();

                interactionsSnapshot.forEach(doc => {
                    const storyId = doc.ref.parent.parent?.id;
                    if (storyId) userInteractions.set(storyId, doc.data().type);
                });
            } catch (err) {
                console.error('Failed to fetch user interactions:', err);
            }
        }

        const stories: Story[] = [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        snapshot.forEach((doc: any) => {
            const data = doc.data();
            // console.log('Story data:', JSON.stringify(data)); // Uncomment to debug specific data
            stories.push({
                id: doc.id,
                ...data,
                reactions: data.reactions || { helpful: 0, inspiring: 0, eyeOpening: 0 },
                userReaction: userInteractions.get(doc.id) || null,
                createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
                publishedAt: data.publishedAt?.toDate?.() || null,
            } as Story);
        });



        // Sort in memory to avoid Firestore index requirement
        stories.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA; // Descending order
        });

        const hasMore = stories.length > pageSize;
        if (hasMore) {
            stories.pop();
        }

        const response: PaginatedResponse<Story> = {
            items: stories,
            nextCursor: hasMore ? stories[stories.length - 1]?.id : undefined,
            hasMore,
            total: stories.length,
        };

        return NextResponse.json(response);

    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error fetching stories:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch stories' },
            { status: 500 }
        );
    }
}
