import api from './axios';
import type { Booking } from '../types';

export const createBookingApi = (data: {
  vehicleId: string;
  serviceCenterId: string;
  slotId: string;
  problemReportId?: string;
  note?: string;
}) => api.post<Booking>('/bookings', data);

export const getMyBookingsApi = ()                         => api.get<Booking[]>('/bookings');
export const getVehicleBookingsApi = (vehicleId: string)   => api.get<Booking[]>('/bookings', { vehicleId } as Record<string, string>);
export const getBookingApi    = (id: string)               => api.get<Booking>(`/bookings/${id}`);
export const cancelBookingApi = (id: string)               => api.patch<Booking>(`/bookings/${id}/cancel`);
export const completeBookingApi = (id: string)             => api.patch<Booking>(`/bookings/${id}/complete`);
