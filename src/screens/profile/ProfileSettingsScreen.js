import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../../store/authStore';
import { STORAGE_KEYS } from '../../constants/storage';
import { COLORS } from '../../constants/theme';

export const ProfileSettingsScreen = () => {
  const { clearAuth, user } = useAuthStore();

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_PROFILE);
      clearAuth();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Settings</Text>
      {user && <Text style={styles.userEmail}>Logged in as: {user.email}</Text>}
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    color: '#505F76',
    marginBottom: 40,
  },
  logoutButton: {
    width: '100%',
    maxWidth: 300,
    height: 50,
    backgroundColor: COLORS.status.error,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.status.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

