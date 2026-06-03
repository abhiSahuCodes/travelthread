import { getPendingSyncItems, removeSyncItem } from '../db/index';
import { useSyncStore } from '../store/syncStore';
import { LIMITS } from '../constants/limits';

class SyncEngine {
  static async drain() {
    const { setSyncStatus, isOfflineModeEnabled } = useSyncStore.getState();
    
    if (isOfflineModeEnabled) {
      return;
    }

    setSyncStatus('syncing');

    try {
      const pendingItems = await getPendingSyncItems();
      
      for (const item of pendingItems) {
        // MOCK: processing each item sequentially
        await removeSyncItem(item.id);
      }
      
      setSyncStatus('synced');
    } catch (error) {
      setSyncStatus('error');
      console.error('Sync failed', error);
    }
  }
}

export default SyncEngine;
