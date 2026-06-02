import { create } from 'zustand';

export const useUIStore = create((set) => ({
  activeBottomSheet: 'none',
  setActiveBottomSheet: (sheet) => set({ activeBottomSheet: sheet }),
}));
