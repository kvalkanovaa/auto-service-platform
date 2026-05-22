import api from './axios';
import type { ProblemReport, AiAnalysisResult } from '../types';

export const getReportsApi  = ()             => api.get<ProblemReport[]>('/problem-reports');
export const getReportApi   = (id: string)   => api.get<ProblemReport>(`/problem-reports/${id}`);
export const deleteReportApi = (id: string)  => api.delete(`/problem-reports/${id}`);

export const createReportApi = (data: {
  vehicleId: string;
  title: string;
  description: string;
  aiSummary?: string;
  aiUrgency?: string;
  aiSuggestedCategories?: string[];
  aiQuestions?: string[];
  aiBriefForShop?: string;
}) => api.post<ProblemReport>('/problem-reports', data);

export const analyzeSymptomsApi = (vehicleId: string, description: string) =>
  api.post<AiAnalysisResult>('/ai/analyze-symptoms', { vehicleId, description });

export const followupReportApi = (id: string, answers: string[]) =>
  api.post<ProblemReport>(`/problem-reports/${id}/followup`, { answers });
