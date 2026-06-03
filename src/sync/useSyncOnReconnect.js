import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import SyncEngine from './SyncEngine';

export function useSyncOnReconnect() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        SyncEngine.drain();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
