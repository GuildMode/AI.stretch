import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useUiStore = create(
  persist(
    (set) => ({
      themeMode: 'light',
      isModalOpen: false,
      modalContent: {
        title: '',
        message: '',
        confirmText: 'OK',
        cancelText: 'キャンセル',
        type: 'alert', // 'alert' or 'prompt'
        inputValue: '',
      },
      onConfirm: () => {},
      onCancel: () => {},

      toggleThemeMode: () => set((state) => ({ 
        themeMode: state.themeMode === 'light' ? 'dark' : 'light' 
      })),

      openModal: ({ title, message, onConfirm, onCancel, confirmText, cancelText, type = 'alert', initialValue = '' }) => set({
        isModalOpen: true,
        modalContent: {
          title: title || '確認',
          message,
          confirmText,
          cancelText: cancelText || '閉じる',
          type,
          inputValue: initialValue,
        },
        onConfirm: (value) => {
          if (onConfirm) {
            type === 'prompt' ? onConfirm(value) : onConfirm();
          }
          set({ isModalOpen: false });
        },
        onCancel: () => {
          if (onCancel) onCancel();
          set({ isModalOpen: false });
        },
      }),

      setModalInputValue: (value) => set(state => ({
        modalContent: { ...state.modalContent, inputValue: value }
      })),

      closeModal: () => set({ isModalOpen: false }),
    }),
    {
      name: 'ai-stretch-app-ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ themeMode: state.themeMode }), // Only persist themeMode
    }
  )
);

export default useUiStore;
