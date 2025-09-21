
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const initialState = {
  userProfile: '',
  activityHistory: [],
  aiSuggestions: [],
  lastStretchSettings: {
    duration: 30,
    rest: 10,
  },
};

/**
 * ユーザーの状態を管理するZustandストア。
 * `persist`ミドルウェアを使用し、状態をlocalStorageに永続化する。
 */
export const useUserStore = create(
  persist(
    (set) => ({
      ...initialState,

      // Actions: 状態を変更するための関数
      setUserProfile: (profile) => set({ userProfile: profile }),

      setAiSuggestions: (suggestions) => set({ 
        aiSuggestions: suggestions 
      }),

      addActivity: (activity) => set((state) => ({
        activityHistory: [activity, ...state.activityHistory],
      })),

      setLastStretchSettings: (settings) => set({ 
        lastStretchSettings: settings 
      }),

      resetUserProfile: () => set({ userProfile: '' }),

      resetActivityHistory: () => set({ 
        activityHistory: [] 
      }),

      // This will reset the entire store to its initial state
      reset: () => set(initialState),
    }),
    {
      name: 'user-storage', // localStorageに保存される際のキー名
      storage: createJSONStorage(() => localStorage), // 使用するストレージを指定
    }
  )
);
