// src/lib/firebase/config.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Log a warning if essential Firebase config variables appear invalid
// This check runs when the module is loaded.
// Note: This check might run on the server and client, depending on import location.
// It's primarily useful for development debugging.
if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId
    ) {
    console.warn(
        `Firebase Initialization Warning: One or more required Firebase config values (apiKey, authDomain, projectId) might be missing or empty. ` +
        `Please ensure NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, and NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variables are set correctly in your .env.local file and the development server is restarted.`
    );
}


// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  // Check explicitly for apiKey before initializing to provide a clearer error
  if (!firebaseConfig.apiKey) {
      const errorMsg = "Firebase Initialization Error: NEXT_PUBLIC_FIREBASE_API_KEY is missing or empty. Cannot initialize Firebase.";
      console.error(errorMsg);
      // Throw an error to prevent the application from proceeding with invalid config.
      // This makes the root cause (missing env var) more apparent than the downstream 'invalid-api-key' error.
      throw new Error(errorMsg + " Check your .env.local file and ensure the server was restarted.");
  }
  try {
    app = initializeApp(firebaseConfig);
  } catch (error: any) {
     console.error("Firebase initializeApp Error:", error);
     // Rethrow or handle as needed. If initializeApp fails (e.g., invalid config format),
     // this catch block will handle it. The 'auth/invalid-api-key' error typically originates
     // from getAuth or subsequent Firebase calls if the key is syntactically valid but incorrect.
     throw error;
  }
} else {
  app = getApp();
}

// Initialize Firestore and Auth
// These lines might throw errors if initialization failed or config is invalid (e.g., auth/invalid-api-key)
let db: Firestore;
let auth: Auth;

try {
    db = getFirestore(app);
    auth = getAuth(app);
} catch (error: any) {
     console.error("Error getting Firestore/Auth instance:", error);
     // Log specific guidance for common errors
     if (error.code === 'auth/invalid-api-key') {
         console.error(
             "Firebase Error (auth/invalid-api-key): The provided API key is invalid. " +
             "Please verify the NEXT_PUBLIC_FIREBASE_API_KEY in your .env.local file and restart the development server."
         );
     }
     // Rethrow the error to halt execution or allow higher-level error handling
     throw error;
}


export { db, auth, app };
