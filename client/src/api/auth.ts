import api from './axios';
import type { User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export const registerApi = (data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) => api.post<AuthResponse>('/auth/register', data);

export const loginApi = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password });

export const logoutApi = () => api.post('/auth/logout');

export const getMeApi = () => api.get<User>('/auth/me');

// Raw fetch — bypasses the wrapper to avoid an infinite refresh loop
export const refreshApi = (): Promise<{ token: string }> =>
  fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' }).then((r) => {
    if (!r.ok) throw new Error('refresh failed');
    return r.json() as Promise<{ token: string }>;
  });

export const updateProfileApi = (data: { firstName: string; lastName: string; email: string; avatarUrl?: string }) =>
  api.put<User>('/auth/profile', data);

export const changePasswordApi = (currentPassword: string, newPassword: string) =>
  api.put<{ message: string }>('/auth/change-password', { currentPassword, newPassword });

export const forgotPasswordApi = (email: string) =>
  api.post<{ message: string }>('/auth/forgot-password', { email });

export const resetPasswordApi = (token: string, password: string) =>
  api.post<{ message: string }>(`/auth/reset-password/${token}`, { password });
