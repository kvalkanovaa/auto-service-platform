import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Review from '../models/Review';
import Booking from '../models/Booking';
import ServiceCenter from '../models/ServiceCenter';

export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      res.status(404).json({ message: 'Резервацията не е намерена' });
      return;
    }
    if (booking.status !== 'completed') {
      res
        .status(400)
        .json({ message: 'Може да оцениш само завършена резервация' });
      return;
    }

    const existing = await Review.findOne({ bookingId });
    if (existing) {
      res
        .status(400)
        .json({ message: 'Вече си оставил оценка за тази резервация' });
      return;
    }

    const review = await Review.create({
      userId,
      serviceCenterId: booking.serviceCenterId,
      bookingId,
      rating,
      comment,
    });

    const allReviews = await Review.find({
      serviceCenterId: booking.serviceCenterId,
    });
    const avg =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await ServiceCenter.findByIdAndUpdate(booking.serviceCenterId, {
      ratingAvg: Math.round(avg * 10) / 10,
      reviewCount: allReviews.length,
    });

    res.status(201).json(review);
  },
);

export const getMyReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const reviews = await Review.find({ userId }).sort({ createdAt: -1 });
    res.json(reviews);
  },
);

export const getServiceCenterReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const reviews = await Review.find({ serviceCenterId: req.params.id })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(reviews);
  },
);
