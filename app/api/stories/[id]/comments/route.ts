import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Comment } from '@/lib/firebase/types';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Params is a Promise in Next.js 15
) {
    try {
        const { id: storyId } = await context.params;

        if (!storyId) {
            return NextResponse.json({ success: false, error: 'Story ID is required' }, { status: 400 });
        }

        const db = getAdminFirestore();
        const commentsRef = db.collection('stories').doc(storyId).collection('comments');
        const snapshot = await commentsRef.orderBy('createdAt', 'desc').get();

        const comments: Comment[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            comments.push({
                id: doc.id,
                storyId,
                authorId: data.authorId,
                authorName: data.authorName,
                // Ensure we map 'text' (DB) to 'content' (Type) if necessary
                content: data.text,
                text: data.text, // Keep text for frontend compatibility
                parentId: data.parentId || null,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
                likes: data.likes || 0,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);
        });

        return NextResponse.json({ success: true, data: comments });
    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error fetching comments:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: storyId } = await context.params;
        const body = await request.json();
        const { text, authorId, authorName, parentId } = body;

        if (!storyId || !text || !authorId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const db = getAdminFirestore();
        const storyRef = db.collection('stories').doc(storyId);

        // Verify story exists
        const storyDoc = await storyRef.get();
        if (!storyDoc.exists) {
            return NextResponse.json({ success: false, error: 'Story not found' }, { status: 404 });
        }

        const newComment = {
            text,
            authorId,
            authorName: authorName || 'Anonymous',
            parentId: parentId || null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            likes: 0
        };

        // Add comment to subcollection
        const commentRef = await storyRef.collection('comments').add(newComment);

        // Update story comment count
        await storyRef.update({
            commentsCount: FieldValue.increment(1)
        });

        return NextResponse.json({
            success: true,
            data: {
                id: commentRef.id,
                storyId,
                ...newComment,
                createdAt: new Date(), // Return client-friendly date
                updatedAt: new Date()
            }
        });

    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error adding comment:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
