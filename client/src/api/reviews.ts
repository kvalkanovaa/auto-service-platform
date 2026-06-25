import api from './axios';
import type { Review } from '../types';

export const createReviewApi = (data: { bookingId: string; rating: number; comment?: string }) =>
  api.post<Review>('/reviews', data);

export const getMyReviewsApi = () => api.get<Review[]>('/reviews/mine');

export const getServiceCenterReviewsApi = (serviceCenterId: string) =>
  api.get<Review[]>(`/reviews/service-center/${serviceCenterId}`);
