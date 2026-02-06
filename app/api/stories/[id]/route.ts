// API Route: Get, Update, Delete a single story
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

// GET - Get a single story by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = getAdminFirestore();
        const docRef = db.collection('stories').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json(
                { success: false, error: 'Story not found' },
                { status: 404 }
            );
        }

        // Increment view count
        await docRef.update({
            views: FieldValue.increment(1),
        });

        const data = docSnap.data();
        const story = {
            id: docSnap.id,
            ...data,
            createdAt: data?.createdAt?.toDate?.() || new Date(),
            updatedAt: data?.updatedAt?.toDate?.() || new Date(),
            publishedAt: data?.publishedAt?.toDate?.() || null,
        };

        return NextResponse.json({ success: true, data: story });

    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error fetching story:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch story' },
            { status: 500 }
        );
    }
}

// PUT - Update a story
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { userId, updates } = body;

        if (!userId || !updates) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = getAdminFirestore();
        const docRef = db.collection('stories').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json(
                { success: false, error: 'Story not found' },
                { status: 404 }
            );
        }

        const storyData = docSnap.data();
        if (storyData?.authorId !== userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized to update this story' },
                { status: 403 }
            );
        }

        await docRef.update({
            ...updates,
            updatedAt: new Date(),
        });

        const updatedSnap = await docRef.get();
        const updatedData = updatedSnap.data();

        return NextResponse.json({
            success: true,
            data: {
                id: updatedSnap.id,
                ...updatedData,
                createdAt: updatedData?.createdAt?.toDate?.() || new Date(),
                updatedAt: updatedData?.updatedAt?.toDate?.() || new Date(),
            },
            message: 'Story updated successfully',
        });

    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error updating story:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update story' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a story
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID required' },
                { status: 400 }
            );
        }

        const db = getAdminFirestore();
        const docRef = db.collection('stories').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json(
                { success: false, error: 'Story not found' },
                { status: 404 }
            );
        }

        const storyData = docSnap.data();
        if (storyData?.authorId !== userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized to delete this story' },
                { status: 403 }
            );
        }

        await docRef.delete();

        return NextResponse.json({
            success: true,
            message: 'Story deleted successfully',
        });

    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error deleting story:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete story' },
            { status: 500 }
        );
    }
}
