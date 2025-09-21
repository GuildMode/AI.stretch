import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from '../firebase';

const usersCollection = 'users';

/**
 * Fetches a user's document from Firestore.
 * @param {string} userId The user's unique ID.
 * @returns {Promise<object | null>} The user's data object, or null if not found.
 */
export const getUserDocument = async (userId) => {
  if (!userId) return null;
  const userDocRef = doc(getFirebaseDb(), usersCollection, userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document! Creating one for the new user.");
      return null;
    }
  } catch (error) {
    console.error("Error getting user document:", error);
    return null;
  }
};

/**
 * Updates (or creates) a user's document in Firestore.
 * @param {string} userId The user's unique ID.
 * @param {object} data The data to merge with the existing document.
 */
export const updateUserDocument = async (userId, data) => {
  if (!userId) return;
  const userDocRef = doc(getFirebaseDb(), usersCollection, userId);
  try {
    // Using setDoc with merge: true will create the document if it doesn't exist,
    // and merge the new data with existing data if it does.
    await setDoc(userDocRef, { 
      ...data,
      lastUpdatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error updating user document:", error);
  }
};
