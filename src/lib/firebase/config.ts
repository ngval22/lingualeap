// src/lib/firebase/config.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Ensure all required config values are present
const requiredConfigKeys: (keyof FirebaseOptions)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

let app;
let auth;
let db;

try {
    const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

    if (missingKeys.length > 0) {
      const errorMsg = `Firebase Initialization Error: The following environment variables are missing or empty: ${missingKeys.map(k => `NEXT_PUBLIC_FIREBASE_${k.toUpperCase()}`).join(', ')}. Cannot initialize Firebase. Check your .env.local file and ensure the server was restarted.`;
      console.error(errorMsg);
      // Not throwing an error here to potentially allow module resolution to succeed,
      // even though Firebase functionality will be broken.
      // The application will likely fail later when trying to use auth or db.
    }

    // Initialize Firebase only if config seems valid (at least apiKey is present)
    // It might still fail later if other keys are truly invalid, but this prevents immediate crash on import.
    if (firebaseConfig.apiKey) {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
    } else {
         // If essential config like apiKey is missing, set exports to null or handle appropriately
         // This prevents errors when importing auth/db if initialization failed silently.
         console.warn("Firebase could not be initialized due to missing configuration. Auth and Firestore will not be available.");
         app = null;
         auth = null;
         db = null;
    }
} catch (error) {
    console.error("Unexpected error during Firebase initialization:", error);
     // Ensure exports are null/undefined on unexpected error too
     app = null;
     auth = null;
     db = null;
}


export { app, auth, db };
