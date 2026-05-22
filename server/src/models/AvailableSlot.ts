import mongoose, { Schema } from 'mongoose';

export interface IAvailableSlot {
  serviceCenterId: mongoose.Types.ObjectId;
  date: string;
  time: string;
  isBooked: boolean;
}

const availableSlotSchema = new Schema<IAvailableSlot>(
  {
    serviceCenterId: { type: Schema.Types.ObjectId, ref: 'ServiceCenter', required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IAvailableSlot>('AvailableSlot', availableSlotSchema);
