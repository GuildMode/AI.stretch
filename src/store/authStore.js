import { create } from 'zustand';
import { getFirebaseAuth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

let authStateListener = null; // To hold the unsubscribe function

const useAuthStore = create((set, get) => ({
  user: null,
  isGuest: false,
  isLoading: true, // isLoading is true until the first auth state is confirmed

  setGuest: () => set({ isGuest: true, isLoading: false, user: null }),
  clearGuest: () => set({ isGuest: false }),

  _updateAuthState: (user) => {
    const isGuest = user ? false : get().isGuest;
    set({ user, isLoading: false, isGuest });
  },

  /**
   * Starts listening for Firebase auth state changes.
   * This should only be called once after Firebase is initialized.
   */
  listenToAuthChanges: () => {
    // Unsubscribe from any previous listener
    if (authStateListener) {
      authStateListener();
    }

    authStateListener = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (user) {
        const simplifiedUser = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        };
        get()._updateAuthState(simplifiedUser);
      } else {
        get()._updateAuthState(null);
      }
    });
  },
}));

export default useAuthStore;