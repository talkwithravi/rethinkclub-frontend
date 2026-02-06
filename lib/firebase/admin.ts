// Firebase Admin SDK for Server-Side Operations
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App;
let adminDb: Firestore;
let adminAuth: Auth;

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
    if (getApps().length === 0) {
        // For production, use service account credentials
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
            : null;

        if (serviceAccount) {
            adminApp = initializeApp({
                credential: cert(serviceAccount),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        } else {
            // For development without service account
            // Firebase Admin will use Application Default Credentials
            adminApp = initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        }
        console.log(`🔥 Firebase Admin initialized for project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
    } else {
        adminApp = getApps()[0];
    }

    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);

    return { adminApp, adminDb, adminAuth };
}

// Lazy initialization
export function getAdminFirestore(): Firestore {
    if (!adminDb) {
        initializeFirebaseAdmin();
    }
    return adminDb;
}

export function getAdminAuth(): Auth {
    if (!adminAuth) {
        initializeFirebaseAdmin();
    }
    return adminAuth;
}

export { adminApp, adminDb, adminAuth };
