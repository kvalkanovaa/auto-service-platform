import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import Vehicle from '../models/Vehicle';
import { analyzeSymptoms } from '../services/aiService';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const analyze = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { vehicleId, description } = req.body;

  if (!vehicleId || !description) {
    const err: AppError = new Error('vehicleId и description са задължителни');
    err.statusCode = 400;
    throw err;
  }

  const vehicle = await Vehicle.findOne({ _id: vehicleId, ownerId: req.user!.id });
  if (!vehicle) {
    const err: AppError = new Error('Автомобилът не е намерен');
    err.statusCode = 404;
    throw err;
  }

  const result = await analyzeSymptoms(vehicle, description);
  res.json(result);
});
