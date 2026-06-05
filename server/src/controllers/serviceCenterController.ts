import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import ServiceCenter from '../models/ServiceCenter';
import AvailableSlot from '../models/AvailableSlot';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export function buildSlots(centerId: mongoose.Types.ObjectId | string, daysAhead = 14) {
  const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  const slots = [];
  const today = new Date();
  for (let d = 1; d <= daysAhead; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    if (date.getDay() === 0) continue; // skip Sunday
    const dateStr = date.toISOString().split('T')[0];
    for (const time of times) {
      slots.push({ serviceCenterId: centerId, date: dateStr, time, isBooked: false });
    }
  }
  return slots;
}

export const getServiceCenters = asyncHandler(async (req: Request, res: Response) => {
  const { city, category } = req.query;
  const filter: Record<string, unknown> = { isApproved: true };
  if (city) filter.city = { $regex: city as string, $options: 'i' };
  if (category) filter.servicesOffered = { $in: [category] };
  const centers = await ServiceCenter.find(filter).sort({ ratingAvg: -1 });
  res.json(centers);
});

export const getServiceCenter = asyncHandler(async (req: Request, res: Response) => {
  const center = await ServiceCenter.findById(req.params.id);
  if (!center) {
    const err: AppError = new Error('Сервизът не е намерен');
    err.statusCode = 404;
    throw err;
  }
  res.json(center);
});

export const getServiceCenterSlots = asyncHandler(async (req: Request, res: Response) => {
  const slots = await AvailableSlot.find({
    serviceCenterId: req.params.id,
    isBooked: false,
    date: { $gte: new Date().toISOString().split('T')[0] },
  }).sort({ date: 1, time: 1 });
  res.json(slots);
});

export const matchServiceCenters = asyncHandler(async (req: Request, res: Response) => {
  const { categories, city } = req.query;
  const categoryList = (categories as string)?.split(',').filter(Boolean) ?? [];
  const filter: Record<string, unknown> = { isApproved: true };
  if (categoryList.length) filter.servicesOffered = { $in: categoryList };
  if (city) filter.city = { $regex: city as string, $options: 'i' };
  const centers = await ServiceCenter.find(filter).sort({ ratingAvg: -1 }).limit(5);
  res.json(centers);
});

// Public: a service shop submits an application; created unapproved, awaiting admin review.
export const applyServiceCenter = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, address, city, region, phone, email, servicesOffered, workingHours, applicationNote } = req.body;
  if (!name || !description || !address || !city || !region || !phone || !email) {
    const err: AppError = new Error('Моля, попълнете всички задължителни полета.');
    err.statusCode = 400;
    throw err;
  }
  const center = await ServiceCenter.create({
    name, description, address, city, region, phone, email,
    servicesOffered: Array.isArray(servicesOffered) ? servicesOffered : [],
    workingHours: workingHours ?? undefined,
    applicationNote: applicationNote || undefined,
    isApproved: false,
  });
  res.status(201).json({ message: 'Заявката е получена и очаква одобрение.', id: center._id });
});

// Admin: list service centers awaiting approval.
export const getPendingServiceCenters = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const centers = await ServiceCenter.find({ isApproved: false }).sort({ createdAt: -1 });
  res.json(centers);
});

// Admin: approve a pending service center and generate its initial slots.
export const approveServiceCenter = asyncHandler(async (req: AuthRequest, res: Response) => {
  const center = await ServiceCenter.findById(req.params.id);
  if (!center) {
    const err: AppError = new Error('Сервизът не е намерен');
    err.statusCode = 404;
    throw err;
  }
  if (!center.isApproved) {
    center.isApproved = true;
    await center.save();
    const existing = await AvailableSlot.countDocuments({ serviceCenterId: center._id });
    if (existing === 0) {
      await AvailableSlot.insertMany(buildSlots(center._id as mongoose.Types.ObjectId));
    }
  }
  res.json(center);
});

export const adminCreateServiceCenter = asyncHandler(async (req: AuthRequest, res: Response) => {
  const center = await ServiceCenter.create({ ...req.body, createdBy: req.user!.id, isApproved: true });
  await AvailableSlot.insertMany(buildSlots(center._id as mongoose.Types.ObjectId));
  res.status(201).json(center);
});

export const adminUpdateServiceCenter = asyncHandler(async (req: AuthRequest, res: Response) => {
  const center = await ServiceCenter.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!center) {
    const err: AppError = new Error('Сервизът не е намерен');
    err.statusCode = 404;
    throw err;
  }
  res.json(center);
});

export const adminDeleteServiceCenter = asyncHandler(async (req: AuthRequest, res: Response) => {
  await ServiceCenter.findByIdAndDelete(req.params.id);
  res.json({ message: 'Сервизът е изтрит' });
});

export const adminAddSlots = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { slots } = req.body as { slots: { date: string; time: string }[] };
  const created = await AvailableSlot.insertMany(
    slots.map((s) => ({ serviceCenterId: req.params.id, date: s.date, time: s.time }))
  );
  res.status(201).json(created);
});

// Regenerate future unbooked slots for a single center (or all centers if id = 'all')
export const adminRefreshSlots = asyncHandler(async (req: AuthRequest, res: Response) => {
  const today = new Date().toISOString().split('T')[0];

  const centers = req.params.id === 'all'
    ? await ServiceCenter.find({})
    : [await ServiceCenter.findById(req.params.id)].filter(Boolean);

  let total = 0;
  for (const center of centers) {
    if (!center) continue;
    // Remove only future unbooked slots so existing bookings are unaffected
    await AvailableSlot.deleteMany({
      serviceCenterId: center._id,
      isBooked: false,
      date: { $gte: today },
    });
    const slots = buildSlots(center._id as mongoose.Types.ObjectId);
    await AvailableSlot.insertMany(slots);
    total += slots.length;
  }

  res.json({ message: `Генерирани ${total} слота за ${centers.length} сервиза` });
});
