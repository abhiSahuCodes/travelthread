import { apiClient } from '../client';

export const login = async (credentials) => {
  const response = await apiClient.post('/api/auth/login', credentials);
  return response.data;
};

export const register = async (data) => {
  const response = await apiClient.post('/api/auth/register', data);
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await apiClient.post('/api/auth/verify-email', { token });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await apiClient.post('/api/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await apiClient.post('/api/auth/reset-password', { token, newPassword });
  return response.data;
};

export const googleLogin = async (idToken) => {
  const response = await apiClient.post('/api/auth/google', { idToken });
  return response.data;
};

export const logout = async (refreshToken) => {
  const response = await apiClient.post('/api/auth/logout', { refreshToken });
  return response.data;
};

export const resendVerification = async (email) => {
  const response = await apiClient.post('/api/auth/resend-verification', { email });
  return response.data;
};

