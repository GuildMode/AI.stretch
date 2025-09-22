import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const initialUserState = {
  userProfile: '',
  activityHistory: [],
  savedRoutines: [],
  lastStretchSettings: {
    duration: 30,
    rest: 10,
  },
  showTagsInSetup: true,
  chatMessages: [], // To store chat history
  aiSuggestions: [], // To store AI suggestions
};

const useUserStore = create(
  persist(
    (set) => ({
      ...initialUserState,
      isLoaded: false, 

      setUserData: (data) => set({ ...data, isLoaded: true }),
      setUserProfile: (profile) => set({ userProfile: profile }),
      addActivity: (newActivity) => set((state) => ({
        activityHistory: [newActivity, ...state.activityHistory],
      })),
      setLastStretchSettings: (settings) => set({ lastStretchSettings: settings }),
      
      // --- Chat related actions ---
      setAiSuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
      addChatMessage: (message) => set(state => ({ chatMessages: [...state.chatMessages, message] })),
      setChatMessages: (messages) => set({ chatMessages: messages }),
      resetChat: () => set({ chatMessages: [], aiSuggestions: [] }),

      // --- Other actions ---
      resetActivityHistory: () => set({ activityHistory: [] }),
      resetUserProfile: () => set({ userProfile: '' }),
      toggleShowTagsInSetup: () => set(state => ({ showTagsInSetup: !state.showTagsInSetup })),
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
        savedRoutines: state.savedRoutines,
        chatMessages: state.chatMessages, // Persist chat messages
        aiSuggestions: state.aiSuggestions, // Persist AI suggestions
      }),
      onRehydrateStorage: (state) => {
        state.isLoaded = true;
      },
    }
  )
);

export default useUserStore;
