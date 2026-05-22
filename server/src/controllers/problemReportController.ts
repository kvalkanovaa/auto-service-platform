import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import ProblemReport from '../models/ProblemReport';
import type { IVehicle } from '../models/Vehicle';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { refineAnalysis } from '../services/aiService';

export const getReports = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reports = await ProblemReport.find({ userId: req.user!.id })
    .populate('vehicleId', 'brand model year')
    .sort({ createdAt: -1 });
  res.json(reports);
});

export const createReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { vehicleId, title, description, aiSummary, aiUrgency, aiSuggestedCategories, aiQuestions, aiBriefForShop } = req.body;

  if (!vehicleId || !title || !description) {
    const err: AppError = new Error('vehicleId, title и description са задължителни');
    err.statusCode = 400;
    throw err;
  }

  const report = await ProblemReport.create({
    userId: req.user!.id,
    vehicleId,
    title,
    description,
    aiSummary,
    aiUrgency,
    aiSuggestedCategories,
    aiQuestions,
    aiBriefForShop,
  });

  res.status(201).json(report);
});

export const getReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const report = await ProblemReport.findOne({ _id: req.params.id, userId: req.user!.id })
    .populate('vehicleId', 'brand model year engine fuelType');
  if (!report) {
    const err: AppError = new Error('Докладът не е намерен');
    err.statusCode = 404;
    throw err;
  }
  res.json(report);
});

export const deleteReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const report = await ProblemReport.findOneAndDelete({ _id: req.params.id, userId: req.user!.id });
  if (!report) {
    const err: AppError = new Error('Докладът не е намерен');
    err.statusCode = 404;
    throw err;
  }
  res.json({ message: 'Докладът е изтрит' });
});

export const followupReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { answers } = req.body;

  if (!Array.isArray(answers)) {
    const err: AppError = new Error('answers трябва да е масив');
    err.statusCode = 400;
    throw err;
  }

  const report = await ProblemReport.findOne({ _id: req.params.id, userId: req.user!.id })
    .populate('vehicleId');

  if (!report) {
    const err: AppError = new Error('Докладът не е намерен');
    err.statusCode = 404;
    throw err;
  }

  if (!report.aiQuestions || report.aiQuestions.length === 0) {
    const err: AppError = new Error('Няма уточняващи въпроси за отговор');
    err.statusCode = 400;
    throw err;
  }

  if (report.aiFollowupAnswers && report.aiFollowupAnswers.length > 0) {
    const err: AppError = new Error('Анализът вече е бил прецизиран');
    err.statusCode = 409;
    throw err;
  }

  const vehicle = report.vehicleId as unknown as IVehicle;
  const refined = await refineAnalysis(vehicle, report.description, report.aiQuestions, answers);

  report.aiSummary = refined.summary;
  report.aiUrgency = refined.urgency;
  report.aiSuggestedCategories = refined.suggestedCategories;
  report.aiQuestions = refined.questions;
  report.aiBriefForShop = refined.briefForShop;
  report.aiFollowupAnswers = answers;

  await report.save();
  await report.populate('vehicleId', 'brand model year engine fuelType');

  res.json(report);
});
