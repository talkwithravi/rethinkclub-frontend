---
description: Guide to separating Development and Production data in Firebase
---

# Separating Dev & Prod Data

To prevent development testing from affecting real user data, you should use separate Firebase projects.

## 1. Create a Production Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it `rethink-club-prod`.
3. Enable **Firestore**, **Authentication**, and **Storage** just like your dev project.
4. Go to **Project Settings** > **General** > **Your apps** and add a Web App.
5. Copy the configuration object (apiKey, authDomain, etc.).

## 2. Configure Environment Variables
You control which database the app uses by changing the API keys in your environment variables.

### Local Development (`.env.local`)
Keep your current `.env.local` file pointing to your **Development** project (e.g., `rethink-club-dev`).
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (Dev Key)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rethink-club-dev
...
```

### Production Deployment (e.g., Vercel/Netlify)
In your hosting dashboard, go to **Settings** > **Environment Variables** and add the keys from your **Production** project.
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (Prod Key)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rethink-club-prod
...
```

## 3. Verify Connection
The application automatically connects to the project specified in these variables.
- When running `npm run dev`, it loads `.env.local`.
- When deployed, it loads the production variables.

## Alternative: Collection Prefixes (Not Recommended for Auth)
If you must use a single project, you can prefix your collections.
1. Update `lib/firebase/utils.ts` to return `dev_stories` or `stories` based on `NODE_ENV`.
2. Update all `db.collection()` calls to use this helper.
*Note: This does not separate User Accounts (Auth), only data.*
