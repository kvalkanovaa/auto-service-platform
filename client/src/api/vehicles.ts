import api from './axios';
import type { Vehicle } from '../types';

type VehiclePayload = Omit<Vehicle, '_id' | 'ownerId' | 'createdAt'>;

export const getVehiclesApi  = ()                               => api.get<Vehicle[]>('/vehicles');
export const getVehicleApi   = (id: string)                     => api.get<Vehicle>(`/vehicles/${id}`);
export const createVehicleApi = (data: VehiclePayload)          => api.post<Vehicle>('/vehicles', data);
export const updateVehicleApi = (id: string, data: Partial<VehiclePayload>) =>
  api.put<Vehicle>(`/vehicles/${id}`, data);
export const deleteVehicleApi = (id: string) => api.delete(`/vehicles/${id}`);
