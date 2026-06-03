import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { API_BASE } from '../constants/api';
import { useSyncStore } from '../store/syncStore';
import { useAuthStore } from '../store/authStore';
import { STORAGE_KEYS } from '../constants/storage';

export class OfflineModeError extends Error {
  constructor(message = 'App is in offline mode') {
    super(message);
    this.name = 'OfflineModeError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'No network connection') {
    super(message);
    this.name = 'NetworkError';
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const { isOfflineModeEnabled } = useSyncStore.getState();
    if (isOfflineModeEnabled) {
      return Promise.reject(new OfflineModeError());
    }

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return Promise.reject(new NetworkError());
    }

    const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loop if the refresh itself fails
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/refresh') {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call the refresh endpoint (assuming it returns tokens in the body)
        const response = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken });
        
        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth
        await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_PROFILE);
        
        useAuthStore.getState().clearAuth();
        
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
