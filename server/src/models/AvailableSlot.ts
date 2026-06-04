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

// Бърза заявка за свободни часове на даден сервиз по дата.
availableSlotSchema.index({ serviceCenterId: 1, date: 1, isBooked: 1 });
// Гарантира, че няма дублиращи се часове (сервиз + дата + час) — защита от двойно резервиране.
availableSlotSchema.index({ serviceCenterId: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.model<IAvailableSlot>('AvailableSlot', availableSlotSchema);
