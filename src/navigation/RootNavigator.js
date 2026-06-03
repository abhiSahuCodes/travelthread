import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import { AuthStack } from './AuthStack';
import { TabNavigator } from './TabNavigator';
import { LogModal } from './LogModal';
import { useAuthStore } from '../store/authStore';
import { useSyncOnReconnect } from '../sync/useSyncOnReconnect';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { isAuthenticated, setUser } = useAuthStore();
  useSyncOnReconnect();
  
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('tt_access_token');
        if (token) {
          setUser({ id: 'dummy', email: 'test@example.com' });
        }
      } catch (e) {}
    };
    checkToken();
  }, [setUser]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="LogModal" component={LogModal} options={{ presentation: 'modal' }} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};