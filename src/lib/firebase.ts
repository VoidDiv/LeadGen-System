/* ============================================================
   FILE: lib/firebase.ts   (REPLACE whole file)
   NEW: Firestore keeps a copy of the leads and content on the device
   (IndexedDB). On a weak or no signal the app still shows them, and
   anything added or changed is sent automatically when the phone is
   back online.
   ============================================================ */

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

// Initialised on first use so pages can still build without environment variables.
const app = () => (getApps().length ? getApp() : initializeApp(config));
export const auth = () => getAuth(app());

let firestore: Firestore | null = null;

export const db = (): Firestore => {
  if (firestore) return firestore;
  const a = app();
  // On the server (while Next.js builds the pages) there is no device storage
  if (typeof window === "undefined") return getFirestore(a);
  try {
    firestore = initializeFirestore(a, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    // Already set up (for example after a hot reload while developing)
    firestore = getFirestore(a);
  }
  return firestore;
};