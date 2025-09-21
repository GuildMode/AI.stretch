import { create } from 'zustand';
import { getFirebaseAuth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const useAuthStore = create((set, get) => ({
  user: null,       // Holds user data from Firebase, or null
  isGuest: false,   // True if the user proceeds as a guest
  isLoading: true,  // True while checking the initial auth state

  // Action to explicitly set guest mode
  setGuest: () => set({ isGuest: true, isLoading: false, user: null }),

  // Action to clear guest mode (e.g., when going back to the home page)
  clearGuest: () => set({ isGuest: false }),

  // Internal action to update the store based on Firebase auth state
  _updateAuthSate: (user) => {
    // If a user logs in, they are no longer a guest
    const isGuest = user ? false : get().isGuest;
    set({ user, isLoading: false, isGuest });
  },
}));

// This part is crucial. It listens to real-time auth changes from Firebase.
// When the app first loads, this checks if the user is already signed in.
onAuthStateChanged(getFirebaseAuth(), (user) => {
  if (user) {
    // User is signed in, update the store with a simplified user object
    const simplifiedUser = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    };
    useAuthStore.getState()._updateAuthSate(simplifiedUser);
  } else {
    // User is signed out or not logged in initially
    useAuthStore.getState()._updateAuthSate(null);
  }
});

export default useAuthStore;
