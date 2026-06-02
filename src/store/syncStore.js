import { create } from 'zustand';

export const useSyncStore = create((set) => ({
  status: 'idle',
  lastSyncedAt: null,
  queueCount: 0,
  isOfflineModeEnabled: false,
  setSyncStatus: (status) => set({ status }),
  setQueueCount: (queueCount) => set({ queueCount }),
  toggleOfflineMode: () => set((state) => ({ isOfflineModeEnabled: !state.isOfflineModeEnabled })),
}));
