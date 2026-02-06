import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
    try {
        const db = getAdminFirestore();
        const auth = getAdminAuth();

        // Categories to count
        const categories = ['career', 'money', 'health', 'relationships', 'personal', 'other', 'work', 'life'];

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Run counts in parallel
        const [
            usersSnapshot,
            storiesSnapshot,
            commentsSnapshot,
            newStoriesSnapshot,
            newCommentsSnapshot,
            newInteractionsSnapshot,
            ...categorySnapshots
        ] = await Promise.all([
            // Total Counts
            db.collection('users').count().get(),
            db.collection('stories').where('status', '==', 'published').count().get(),
            db.collectionGroup('comments').count().get(),

            // Active Today Counts (Activity in last 24h)
            db.collection('stories').where('createdAt', '>=', oneDayAgo).count().get(),
            db.collectionGroup('comments').where('createdAt', '>=', oneDayAgo).count().get(),
            db.collectionGroup('interactions').where('createdAt', '>=', oneDayAgo).count().get(),

            // Category Counts
            ...categories.map(cat =>
                db.collection('stories')
                    .where('status', '==', 'published')
                    .where('category', '==', cat)
                    .count()
                    .get()
            )
        ]);

        const categoryCounts = categories.reduce((acc, cat, index) => {
            acc[cat] = categorySnapshots[index].data().count;
            return acc;
        }, {} as Record<string, number>);

        // Calculate Active Today (Sum of new stories, comments, and interactions)
        const activeToday =
            newStoriesSnapshot.data().count +
            newCommentsSnapshot.data().count +
            newInteractionsSnapshot.data().count;

        const stats = {
            members: usersSnapshot.data().count,
            discussions: storiesSnapshot.data().count,
            comments: commentsSnapshot.data().count,
            activeToday: activeToday,
            categories: categoryCounts
        };

        // Fallback: If Firestore users count is 0 (sync issue), try fetching from Auth
        if (stats.members === 0) {
            try {
                // listUsers returns a batch, but meta is limited.
                // We'll just list 1000 to get a "better than zero" number if possible,
                // or relies on the fact that for small apps iteration is ok.
                // Actually, just checking if there are ANY.
                const userList = await auth.listUsers(100);
                if (userList.users.length > 0) {
                    stats.members = userList.users.length;
                }
            } catch (authError) {
                console.warn('Failed to fetch auth users fallback:', authError);
            }
        }

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (err: unknown) {
        console.error('Error fetching stats:', err);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
