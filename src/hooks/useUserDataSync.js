import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import useUserStore, { initialUserState } from '../store/userStore';
import { getUserDocument, updateUserDocument } from '../services/firestoreService';
import { useDebouncedCallback } from 'use-debounce';

const GUEST_STORAGE_KEY = 'guest-user-data';

/**
 * This hook is the heart of the data persistence strategy.
 * It syncs the userStore with either Firestore (for logged-in users)
 * or localStorage (for guests).
 */
const useUserDataSync = () => {
  const { user, isGuest } = useAuthStore();
  const { setUserData, reset, ...userData } = useUserStore();

  // 1. Fetch data when auth state changes (login, logout, become guest)
  useEffect(() => {
    if (user?.uid) {
      console.log(`User logged in: ${user.uid}. Fetching data from Firestore...`);
      getUserDocument(user.uid).then(data => {
        if (data) {
          console.log("Found existing user data.");
          setUserData(data);
        } else {
          console.log("New user, setting initial state.");
          reset();
        }
      });
    } else if (isGuest) {
      console.log("User is a guest. Fetching data from localStorage...");
      try {
        const guestData = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY));
        if (guestData) {
          console.log("Found existing guest data.");
          setUserData(guestData);
        } else {
          console.log("New guest, setting initial state.");
          reset();
        }
      } catch (error) {
        console.error("Failed to parse guest data from localStorage", error);
        reset();
      }
    } else {
      // User is logged out and not a guest
      console.log("User logged out, resetting state.");
      reset();
    }
  }, [user, isGuest, setUserData, reset]);

  // 2. Create a debounced function to save data.
  // This prevents excessive writes to the database/localStorage on every small state change.
  const debouncedSave = useDebouncedCallback((currentUser, currentIsGuest, data) => {
    // Destructure to remove properties we don't want to save
    const { isLoaded, aiSuggestions, ...dataToSave } = data;

    if (currentUser?.uid) {
      console.log("Saving data to Firestore...");
      updateUserDocument(currentUser.uid, dataToSave);
    } else if (currentIsGuest) {
      console.log("Saving data to localStorage...");
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, 1500); // Wait 1.5 seconds after the last change before saving

  // 3. Watch for changes in user data and trigger the debounced save.
  useEffect(() => {
    // Only save if the data has been loaded first, to prevent overwriting fresh data with initial state
    if (userData.isLoaded) {
      debouncedSave(user, isGuest, userData);
    }
  }, [userData, user, isGuest, debouncedSave]);
};

export default useUserDataSync;
