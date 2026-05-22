import mongoose, { Schema } from 'mongoose';

export interface IBooking {
  userId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  serviceCenterId: mongoose.Types.ObjectId;
  problemReportId?: mongoose.Types.ObjectId;
  slotId: mongoose.Types.ObjectId;
  bookedDate: string;
  bookedTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  note?: string;
  aiBriefSnapshot?: string;
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    serviceCenterId: { type: Schema.Types.ObjectId, ref: 'ServiceCenter', required: true },
    problemReportId: { type: Schema.Types.ObjectId, ref: 'ProblemReport' },
    slotId: { type: Schema.Types.ObjectId, ref: 'AvailableSlot', required: true },
    bookedDate: { type: String, required: true },
    bookedTime: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'confirmed' },
    note: { type: String },
    aiBriefSnapshot: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>('Booking', bookingSchema);
