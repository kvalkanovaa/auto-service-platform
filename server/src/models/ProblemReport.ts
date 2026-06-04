import mongoose, { Schema } from 'mongoose';

export type ReportStatus = 'open' | 'booked' | 'closed';
export type Urgency = 'low' | 'medium' | 'high' | 'critical';

export interface IProblemReport {
  userId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: ReportStatus;
  aiSummary?: string;
  aiUrgency?: Urgency;
  aiSuggestedCategories?: string[];
  aiQuestions?: string[];
  aiBriefForShop?: string;
  aiFollowupAnswers?: string[];
  createdAt: Date;
}

const problemReportSchema = new Schema<IProblemReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['open', 'booked', 'closed'],
      default: 'open',
    },
    aiSummary: { type: String },
    aiUrgency: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    aiSuggestedCategories: [{ type: String }],
    aiQuestions: [{ type: String }],
    aiBriefForShop: { type: String },
    aiFollowupAnswers: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IProblemReport>('ProblemReport', problemReportSchema);
