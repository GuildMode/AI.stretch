import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useStretchStore = create(
  persist(
    (set, get) => ({
      stretches: [],
      isInitialized: false,

      initializeStretches: async () => {
        if (get().isInitialized) return;
        try {
          const response = await fetch('/data/stretch-data.json');
          if (!response.ok) throw new Error('Failed to fetch stretch data.');
          const data = await response.json();
          // 初期データに isFavorite: false を付与
          const initialStretches = data.map(s => ({ ...s, isFavorite: s.isFavorite || false }));
          set({ stretches: initialStretches, isInitialized: true });
        } catch (error) {
          console.error("Error initializing stretch store:", error);
          set({ isInitialized: true });
        }
      },

      toggleFavorite: (stretchId) => {
        set((state) => ({
          stretches: state.stretches.map(s =>
            s.id === stretchId ? { ...s, isFavorite: !s.isFavorite } : s
          ),
        }));
      },
    }),
    {
      name: 'ai-stretch-app-stretch-store', // localStorageのキー名
      storage: createJSONStorage(() => localStorage),
      // isInitializedは永続化しない
      partialize: (state) => ({ stretches: state.stretches }),
    }
  )
);
