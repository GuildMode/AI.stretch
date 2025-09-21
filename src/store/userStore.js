import { create } from 'zustand';

// This is the initial, empty state for the user's data.
export const initialUserState = {
  userProfile: '',
  activityHistory: [],
  lastStretchSettings: {
    duration: 30,
    rest: 10,
  },
};

const useUserStore = create((set) => ({
  ...initialUserState,
  isLoaded: false, // To track if data has been loaded from the backend/localStorage
  aiSuggestions: [], // This is session-specific, not persisted

  // Action to completely overwrite state, used after fetching data
  setUserData: (data) => set({ ...data, isLoaded: true }),

  // Actions to update specific parts of the state
  setUserProfile: (profile) => set({ userProfile: profile }),
  
  addActivity: (activity) => set((state) => ({
    activityHistory: [activity, ...state.activityHistory],
  })),

  setLastStretchSettings: (settings) => set({ lastStretchSettings: settings }),
  
  setAiSuggestions: (suggestions) => set({ aiSuggestions: suggestions }),

  resetActivityHistory: () => set({ activityHistory: [] }),
  
  resetUserProfile: () => set({ userProfile: '' }),

  // Resets the store to its initial state (on logout or for new guests)
  reset: () => set({ ...initialUserState, isLoaded: true }),
}));

export default useUserStore;