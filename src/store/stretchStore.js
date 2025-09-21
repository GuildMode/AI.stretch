import { create } from 'zustand';

/**
 * ストレッチデータを管理するZustandストア。
 * アプリケーションの起動時にJSONファイルからデータを非同期に読み込み、
 * メモリ上でのCRUD操作を提供します。
 * ファイルへの永続化は、このストアの外部で行う必要があります。
 */
export const useStretchStore = create((set, get) => ({
  stretches: [],
  isInitialized: false,

  // --- Actions ---

  /**
   * public/data/stretch-data.jsonからデータをフェッチしてストアを初期化します。
   */
  initializeStretches: async () => {
    if (get().isInitialized) return;

    try {
      const response = await fetch('/data/stretch-data.json');
      if (!response.ok) {
        throw new Error('Failed to fetch stretch data.');
      }
      const data = await response.json();
      set({ stretches: data, isInitialized: true });
    } catch (error) {
      console.error("Error initializing stretch store:", error);
      // 初期化に失敗した場合、フォールバックとして空の配列を設定
      set({ isInitialized: true }); 
    }
  },

  /**
   * 新しいストレッチをメモリ内ストアに追加します。
   * @param {object} newStretch - 追加するストレッチオブジェクト
   */
  addStretch: (newStretch) => set((state) => ({
    stretches: [...state.stretches, newStretch],
  })),

  /**
   * 既存のストレッチを更新します。
   * @param {object} updatedStretch - 更新されたストレッチオブジェクト
   */
  updateStretch: (updatedStretch) => set((state) => ({
    stretches: state.stretches.map(s => 
      s.id === updatedStretch.id ? updatedStretch : s
    ),
  })),

  /**
   * IDに基づいてストレッチを削除します。
   * @param {string} id - 削除するストレッチのID
   */
  deleteStretch: (id) => set((state) => ({
    stretches: state.stretches.filter(s => s.id !== id),
  })),
}));
