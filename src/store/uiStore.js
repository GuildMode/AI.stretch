import { create } from 'zustand';

const useUiStore = create((set) => ({
  isModalOpen: false,
  modalContent: {
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'キャンセル',
  },
  onConfirm: () => {},
  onCancel: () => {},

  openModal: ({ title, message, onConfirm, onCancel, confirmText, cancelText }) => set({
    isModalOpen: true,
    modalContent: {
      title: title || '確認',
      message,
      confirmText: confirmText,
      cancelText: cancelText || '閉じる',
    },
    onConfirm: () => {
      if (onConfirm) onConfirm();
      set({ isModalOpen: false });
    },
    onCancel: () => {
      if (onCancel) onCancel();
      set({ isModalOpen: false });
    },
  }),

  closeModal: () => set({ isModalOpen: false }),
}));

export default useUiStore;
