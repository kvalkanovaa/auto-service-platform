import api from './axios';

export const sendContactMessageApi = (data: { name: string; email: string; message: string }) =>
  api.post<{ message: string }>('/contact', data);
