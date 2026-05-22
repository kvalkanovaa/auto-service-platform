import mongoose, { Schema } from 'mongoose';

export interface IVehicle {
  ownerId: mongoose.Types.ObjectId;
  brand: string;
  model: string;
  year: number;
  engine: string;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg';
  transmission: 'manual' | 'automatic';
  vin?: string;
  registrationNumber?: string;
  mileage?: number;
  imageUrl?: string;
  createdAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    engine: { type: String, required: true, trim: true },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid', 'lpg'],
      required: true,
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic'],
      required: true,
    },
    vin: { type: String, trim: true },
    registrationNumber: { type: String, trim: true },
    mileage: { type: Number },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IVehicle>('Vehicle', vehicleSchema);
