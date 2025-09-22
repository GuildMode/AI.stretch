import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const initialUserState = {
  userProfile: '',
  activityHistory: [],
  savedRoutines: [], // <--- New state for saved routines
  lastStretchSettings: {
    duration: 30,
    rest: 10,
  },
  showTagsInSetup: true,
};

const useUserStore = create(
  persist(
    (set) => ({
      ...initialUserState,
      isLoaded: false, 
      aiSuggestions: [],

      setUserData: (data) => set({ ...data, isLoaded: true }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      addActivity: (newActivity) => set((state) => ({
        activityHistory: [newActivity, ...state.activityHistory],
      })),
      setLastStretchSettings: (settings) => set({ lastStretchSettings: settings }),
      setAiSuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
      resetActivityHistory: () => set({ activityHistory: [] }),
      resetUserProfile: () => set({ userProfile: '' }),
      toggleShowTagsInSetup: () => set(state => ({ showTagsInSetup: !state.showTagsInSetup })),

      // --- Actions for saved routines ---
      addRoutine: (routine) => set(state => ({ savedRoutines: [...state.savedRoutines, routine] })),
      deleteRoutine: (routineId) => set(state => ({ 
        savedRoutines: state.savedRoutines.filter(r => r.id !== routineId) 
      })),

      reset: () => set({ ...initialUserState, isLoaded: true }),
    }),
    {
      name: 'ai-stretch-app-user-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userProfile: state.userProfile,
        activityHistory: state.activityHistory,
        lastStretchSettings: state.lastStretchSettings,
        showTagsInSetup: state.showTagsInSetup,
        savedRoutines: state.savedRoutines, // <--- Persist saved routines
      }),
      onRehydrateStorage: (state) => {
        state.isLoaded = true;
      },
    }
  )
);

export default useUserStore;