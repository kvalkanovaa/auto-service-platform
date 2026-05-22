import mongoose, { Schema } from 'mongoose';

export interface IReview {
  userId: mongoose.Types.ObjectId;
  serviceCenterId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    serviceCenterId: { type: Schema.Types.ObjectId, ref: 'ServiceCenter', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>('Review', reviewSchema);
