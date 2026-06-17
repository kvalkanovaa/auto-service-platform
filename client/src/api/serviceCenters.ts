import api from './axios';
import type { ServiceCenter, AvailableSlot } from '../types';

export const getServiceCentersApi = (params?: { city?: string; category?: string }) =>
  api.get<ServiceCenter[]>('/service-centers', params as Record<string, string | undefined>);

export const getServiceCenterApi = (id: string) =>
  api.get<ServiceCenter>(`/service-centers/${id}`);

export const getServiceCenterSlotsApi = (id: string) =>
  api.get<AvailableSlot[]>(`/service-centers/${id}/slots`);

export const matchServiceCentersApi = (categories: string[], city?: string) =>
  api.get<ServiceCenter[]>('/service-centers/match', { categories: categories.join(','), city });

export const createServiceCenterApi = (data: {
  name: string; description: string; address: string; city: string; region: string;
  phone: string; email: string; servicesOffered: string[];
  workingHours: { open: string; close: string; days: string[] };
}) => api.post<ServiceCenter>('/service-centers', data);

export const updateServiceCenterApi = (id: string, data: {
  name: string; description: string; address: string; city: string; region: string;
  phone: string; email: string; servicesOffered: string[];
  workingHours: { open: string; close: string; days: string[] };
}) => api.put<ServiceCenter>(`/service-centers/${id}`, data);

export const deleteServiceCenterApi = (id: string) => api.delete(`/service-centers/${id}`);

export const refreshAllSlotsApi = () => api.post('/service-centers/all/refresh-slots');

// Public application by a service shop (created unapproved, awaiting admin review)
export const applyServiceCenterApi = (data: {
  name: string; description: string; address: string; city: string; region: string;
  phone: string; email: string; servicesOffered: string[];
  workingHours: { open: string; close: string; days: string[] };
  applicationNote?: string;
}) => api.post<{ message: string; id: string }>('/service-centers/apply', data);

// Admin: pending applications + approve
export const getPendingServiceCentersApi = () =>
  api.get<ServiceCenter[]>('/service-centers/pending');

export const approveServiceCenterApi = (id: string) =>
  api.patch<ServiceCenter>(`/service-centers/${id}/approve`);
