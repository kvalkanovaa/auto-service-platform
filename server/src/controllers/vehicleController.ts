import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import Vehicle from '../models/Vehicle';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getVehicles = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vehicles = await Vehicle.find({ ownerId: req.user!.id }).sort({ createdAt: -1 });
  res.json(vehicles);
});

export const createVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { brand, model, year, engine, fuelType, transmission, vin, registrationNumber, mileage, imageUrl } = req.body;

  if (!brand || !model || !year || !engine || !fuelType || !transmission) {
    const err: AppError = new Error('Всички задължителни полета са нужни');
    err.statusCode = 400;
    throw err;
  }

  const vehicle = await Vehicle.create({
    ownerId: req.user!.id,
    brand,
    model,
    year,
    engine,
    fuelType,
    transmission,
    vin,
    registrationNumber,
    mileage,
    imageUrl,
  });

  res.status(201).json(vehicle);
});

export const getVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, ownerId: req.user!.id });
  if (!vehicle) {
    const err: AppError = new Error('Автомобилът не е намерен');
    err.statusCode = 404;
    throw err;
  }
  res.json(vehicle);
});

export const updateVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, ownerId: req.user!.id });
  if (!vehicle) {
    const err: AppError = new Error('Автомобилът не е намерен');
    err.statusCode = 404;
    throw err;
  }

  const allowed = ['brand', 'model', 'year', 'engine', 'fuelType', 'transmission', 'vin', 'registrationNumber', 'mileage', 'imageUrl'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) (vehicle as unknown as Record<string, unknown>)[field] = req.body[field];
  });

  await vehicle.save();
  res.json(vehicle);
});

export const deleteVehicle = asyncHandler(async (req: AuthRequest, res: Response) => {
  const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, ownerId: req.user!.id });
  if (!vehicle) {
    const err: AppError = new Error('Автомобилът не е намерен');
    err.statusCode = 404;
    throw err;
  }
  res.json({ message: 'Автомобилът е изтрит' });
});
