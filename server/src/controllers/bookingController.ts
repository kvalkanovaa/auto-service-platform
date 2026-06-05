import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Booking from '../models/Booking';
import AvailableSlot from '../models/AvailableSlot';
import ProblemReport from '../models/ProblemReport';
import ServiceCenter from '../models/ServiceCenter';
import Vehicle from '../models/Vehicle';
import User from '../models/User';
import {
  sendBookingConfirmationToCustomer,
  sendBookingNotificationToShop,
  sendBookingCancellationToShop,
} from '../services/emailService';

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { vehicleId, serviceCenterId, problemReportId, slotId, note } = req.body;

  const slot = await AvailableSlot.findById(slotId);
  if (!slot) { res.status(404).json({ message: 'Слотът не е намерен' }); return; }
  if (slot.isBooked) { res.status(400).json({ message: 'Часът вече е зает' }); return; }

  let aiBriefSnapshot: string | undefined;
  if (problemReportId) {
    const report = await ProblemReport.findById(problemReportId);
    if (report?.aiBriefForShop) aiBriefSnapshot = report.aiBriefForShop;
  }

  const booking = await Booking.create({
    userId,
    vehicleId,
    serviceCenterId,
    problemReportId: problemReportId || undefined,
    slotId,
    bookedDate: slot.date,
    bookedTime: slot.time,
    note,
    aiBriefSnapshot,
  });

  slot.isBooked = true;
  await slot.save();

  // Update problem report status to 'booked'
  if (problemReportId) {
    await ProblemReport.findByIdAndUpdate(problemReportId, { status: 'booked' });
  }

  res.status(201).json(booking);

  // Best-effort notifications — never block or fail the booking
  try {
    const [user, center, vehicle] = await Promise.all([
      User.findById(userId),
      ServiceCenter.findById(serviceCenterId),
      Vehicle.findById(vehicleId),
    ]);
    const vehicleStr = vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.year})` : '—';
    if (user?.email) {
      await sendBookingConfirmationToCustomer(user.email, user.firstName, {
        centerName: center?.name ?? 'сервиз',
        date: slot.date,
        time: slot.time,
        address: center ? `${center.city}, ${center.address}` : '',
      });
    }
    if (center?.email) {
      await sendBookingNotificationToShop(center.email, {
        centerName: center.name,
        customerName: user ? `${user.firstName} ${user.lastName}` : '—',
        vehicle: vehicleStr,
        date: slot.date,
        time: slot.time,
        note,
        brief: aiBriefSnapshot,
      });
    }
  } catch (e) {
    console.error('Booking notification email failed:', e);
  }
});

export const getMyBookings = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { vehicleId } = req.query;
  const filter: Record<string, unknown> = { userId };
  if (vehicleId) filter.vehicleId = vehicleId;
  const bookings = await Booking.find(filter)
    .populate('vehicleId', 'brand model year')
    .populate('serviceCenterId', 'name city address')
    .populate('problemReportId', 'title aiUrgency')
    .sort({ createdAt: -1 });
  res.json(bookings);
});

export const getBooking = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const booking = await Booking.findOne({ _id: req.params.id, userId })
    .populate('vehicleId', 'brand model year')
    .populate('serviceCenterId', 'name city address phone')
    .populate('problemReportId', 'title description aiUrgency aiSummary aiBriefForShop');
  if (!booking) { res.status(404).json({ message: 'Резервацията не е намерена' }); return; }
  res.json(booking);
});

export const completeBooking = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const booking = await Booking.findOne({ _id: req.params.id, userId });
  if (!booking) { res.status(404).json({ message: 'Резервацията не е намерена' }); return; }
  if (booking.status === 'cancelled') { res.status(400).json({ message: 'Отменена резервация не може да бъде завършена' }); return; }
  if (booking.status === 'completed') { res.status(400).json({ message: 'Резервацията вече е завършена' }); return; }

  booking.status = 'completed';
  await booking.save();

  res.json(booking);
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const booking = await Booking.findOne({ _id: req.params.id, userId });
  if (!booking) { res.status(404).json({ message: 'Резервацията не е намерена' }); return; }
  if (booking.status === 'cancelled') { res.status(400).json({ message: 'Вече е отменена' }); return; }

  booking.status = 'cancelled';
  await booking.save();

  await AvailableSlot.findByIdAndUpdate(booking.slotId, { isBooked: false });

  // Revert problem report status back to 'open' if no other active booking references it
  if (booking.problemReportId) {
    const otherActive = await Booking.findOne({
      problemReportId: booking.problemReportId,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (!otherActive) {
      await ProblemReport.findByIdAndUpdate(booking.problemReportId, { status: 'open' });
    }
  }

  res.json(booking);

  // Best-effort notification to the shop that the slot was freed
  try {
    const [center, vehicle] = await Promise.all([
      ServiceCenter.findById(booking.serviceCenterId),
      Vehicle.findById(booking.vehicleId),
    ]);
    if (center?.email) {
      await sendBookingCancellationToShop(center.email, {
        centerName: center.name,
        vehicle: vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.year})` : '—',
        date: booking.bookedDate,
        time: booking.bookedTime,
      });
    }
  } catch (e) {
    console.error('Cancellation email failed:', e);
  }
});
