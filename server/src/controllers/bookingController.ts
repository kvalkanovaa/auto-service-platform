import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Booking from '../models/Booking';
import AvailableSlot from '../models/AvailableSlot';
import ProblemReport from '../models/ProblemReport';

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
});
