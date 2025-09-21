import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This module now follows a singleton pattern to ensure Firebase is only initialized once.

let firebaseApp;
let firebaseAuth;
let firebaseDb;
let isInitialized = false;

// The GoogleAuthProvider can be created and exported immediately.
export const googleProvider = new GoogleAuthProvider();

/**
 * Fetches the Firebase config from our secure serverless function and initializes the app.
 * This function must be called once at the root of the application before any other
 * Firebase services are used.
 * @returns {Promise<boolean>} A promise that resolves to true on successful initialization.
 */
export const initializeFirebase = async () => {
  if (isInitialized) {
    return true;
  }

  try {
    const response = await fetch('/api/getFirebaseConfig');
    if (!response.ok) {
      throw new Error(`Failed to fetch Firebase config: ${response.status} ${response.statusText}`);
    }
    const firebaseConfig = await response.json();

    if (!firebaseConfig.apiKey) {
        throw new Error("Fetched Firebase config is invalid or empty.");
    }

    firebaseApp = initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
    
    isInitialized = true;
    console.log("Firebase initialized successfully.");
    return true;
  } catch (error) {
    console.error("Firebase initialization failed critically:", error);
    // This is a critical error, so we might want to display a global error message.
    return false;
  }
};

/**
 * Getter for the Firebase Auth instance.
 * @returns {import("firebase/auth").Auth} The Firebase Auth instance.
 * @throws {Error} If called before Firebase is initialized.
 */
export const getFirebaseAuth = () => {
  if (!isInitialized) {
    throw new Error("Firebase has not been initialized. Call initializeFirebase() at the app root.");
  }
  return firebaseAuth;
};

/**
 * Getter for the Firestore DB instance.
 * @returns {import("firebase/firestore").Firestore} The Firestore instance.
 * @throws {Error} If called before Firebase is initialized.
 */
export const getFirebaseDb = () => {
  if (!isInitialized) {
    throw new Error("Firebase has not been initialized. Call initializeFirebase() at the app root.");
  }
  return firebaseDb;
};