
import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase/admin';


export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Updated for Next.js 15+ async params
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { userId, type } = body as { userId: string; type: 'helpful' | 'inspiring' | 'eyeOpening' };

        if (!userId || !type) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = getAdminFirestore();
        const storyRef = db.collection('stories').doc(id);
        const interactionRef = storyRef.collection('interactions').doc(userId);

        // Run transaction to ensure consistency
        const result = await db.runTransaction(async (t) => {
            const storyDoc = await t.get(storyRef);
            const interactionDoc = await t.get(interactionRef);

            if (!storyDoc.exists) {
                throw new Error('Story not found');
            }

            const currentReactions = storyDoc.data()?.reactions || { helpful: 0, inspiring: 0, eyeOpening: 0 };
            const existingInteraction = interactionDoc.exists ? interactionDoc.data() : null;

            const newReactions = { ...currentReactions };
            let userAction = 'added'; // added, removed, changed

            if (existingInteraction && existingInteraction.type === type) {
                // Removing reaction (toggle off)
                console.log(`User ${userId} removing reaction ${type}`);
                newReactions[type] = Math.max(0, newReactions[type] - 1);
                t.delete(interactionRef);
                userAction = 'removed';
            } else if (existingInteraction) {
                // Changing reaction type
                const oldType = existingInteraction.type;
                console.log(`User ${userId} changing reaction from ${oldType} to ${type}`);
                newReactions[oldType] = Math.max(0, newReactions[oldType] - 1);
                newReactions[type]++;
                t.set(interactionRef, { type, userId, createdAt: new Date() });
                userAction = 'changed';
            } else {
                // Adding new reaction
                console.log(`User ${userId} adding new reaction ${type}`);
                newReactions[type]++;
                t.set(interactionRef, { type, userId, createdAt: new Date() });
                userAction = 'added';
            }

            console.log('New reactions state:', JSON.stringify(newReactions));
            // Update story reactions count
            t.update(storyRef, { reactions: newReactions });

            return { newReactions, userAction };
        });

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (err: unknown) {
        const error = err as { message: string };
        console.error('Error handling reaction:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update reaction' },
            { status: 500 }
        );
    }
}
