// API Route: Like/Unlike a story
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// POST - Like a story
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID required' },
                { status: 400 }
            );
        }

        const db = getAdminFirestore();
        const storyRef = db.collection('stories').doc(id);
        const likeRef = db.collection('likes').doc(`${userId}_${id}`);

        // Check if already liked
        const likeSnap = await likeRef.get();

        if (likeSnap.exists) {
            // Unlike - remove the like
            await likeRef.delete();
            await storyRef.update({
                likes: FieldValue.increment(-1),
            });

            const storySnap = await storyRef.get();
            return NextResponse.json({
                success: true,
                data: {
                    liked: false,
                    likes: storySnap.data()?.likes || 0,
                },
                message: 'Story unliked',
            });
        } else {
            // Like - add the like
            await likeRef.set({
                userId,
                storyId: id,
                createdAt: new Date(),
            });
            await storyRef.update({
                likes: FieldValue.increment(1),
            });

            const storySnap = await storyRef.get();
            return NextResponse.json({
                success: true,
                data: {
                    liked: true,
                    likes: storySnap.data()?.likes || 0,
                },
                message: 'Story liked',
            });
        }

    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error liking story:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to like story' },
            { status: 500 }
        );
    }
}

// GET - Check if user liked a story
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ liked: false });
        }

        const db = getAdminFirestore();
        const likeRef = db.collection('likes').doc(`${userId}_${id}`);
        const likeSnap = await likeRef.get();

        return NextResponse.json({
            liked: likeSnap.exists,
        });

    } catch (err: unknown) {
        console.error('Error checking like status:', err);
        return NextResponse.json({ liked: false });
    }
}
