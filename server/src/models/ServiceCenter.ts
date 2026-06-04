import mongoose, { Schema } from 'mongoose';

export interface IServiceCenter {
  name: string;
  description: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  servicesOffered: string[];
  workingHours: { open: string; close: string; days: string[] };
  ratingAvg: number;
  reviewCount: number;
  isApproved: boolean;
  applicationNote?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const serviceCenterSchema = new Schema<IServiceCenter>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    region: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    servicesOffered: [{ type: String }],
    workingHours: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      days: [{ type: String }],
    },
    ratingAvg: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    applicationNote: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Публичният списък филтрира по одобрение и (по избор) по град.
serviceCenterSchema.index({ isApproved: 1, city: 1 });

export default mongoose.model<IServiceCenter>('ServiceCenter', serviceCenterSchema);
