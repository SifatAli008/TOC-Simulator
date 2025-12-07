'use client'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Check if we have valid Firebase configuration first
const hasValidFirebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "build-mock-key" &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== "build-project" &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID !== "1:123456789:web:buildmock";

// Your web app's Firebase configuration
// Only create config if we have valid environment variables
const firebaseConfig = hasValidFirebaseConfig ? {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
} : null;

// Validate that all required environment variables are present
// Skip validation during build time if we're in a build environment
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

// Only throw error if we're not in build mode and missing variables
if (missingEnvVars.length > 0 && typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  console.warn(`Missing Firebase environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Firebase functionality may be limited');
}

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let analytics: any = null;

if (hasValidFirebaseConfig && firebaseConfig) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize Firebase services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Initialize Analytics only on client side and when supported
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      }).catch(() => {
        // Analytics not supported in this environment
      });
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
} else {
  if (typeof window !== 'undefined') {
    console.warn('Firebase not initialized: Missing or invalid environment variables');
    console.warn('The app will work in offline mode without cloud features');
  }
}

export { auth, db, storage, analytics };

export default app;
