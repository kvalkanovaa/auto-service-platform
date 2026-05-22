export interface AvailableSlot {
  _id: string;
  serviceCenterId: string;
  date: string;
  time: string;
  isBooked: boolean;
}

export type UserRole = 'user' | 'service_owner' | 'admin';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg';
export type Transmission = 'manual' | 'automatic';

export interface Vehicle {
  _id: string;
  ownerId: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  fuelType: FuelType;
  transmission: Transmission;
  vin?: string;
  registrationNumber?: string;
  mileage?: number;
  imageUrl?: string;
  createdAt: string;
}

export type ServiceCategory =
  | 'engine'
  | 'diagnostics'
  | 'brakes'
  | 'suspension'
  | 'tires'
  | 'electrical'
  | 'air-conditioning'
  | 'bodywork'
  | 'transmission'
  | 'oil-service';

export interface ServiceCenter {
  _id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  servicesOffered: ServiceCategory[];
  workingHours: { open: string; close: string; days: string[] };
  ratingAvg: number;
  reviewCount: number;
  isApproved: boolean;
  createdAt: string;
}

export type Urgency = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'open' | 'matched' | 'booked' | 'closed';

export interface ProblemReport {
  _id: string;
  userId: string;
  vehicleId: Vehicle;
  title: string;
  description: string;
  status: ReportStatus;
  aiSummary?: string;
  aiUrgency?: Urgency;
  aiSuggestedCategories?: ServiceCategory[];
  aiQuestions?: string[];
  aiBriefForShop?: string;
  aiFollowupAnswers?: string[];
  selectedServiceCenterId?: string;
  createdAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  _id: string;
  userId: string;
  vehicleId: Vehicle;
  serviceCenterId: ServiceCenter;
  problemReportId: ProblemReport;
  slotId: string;
  bookedDate: string;
  bookedTime: string;
  status: BookingStatus;
  note?: string;
  aiBriefSnapshot?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  userId: User;
  serviceCenterId: string;
  bookingId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AiAnalysisResult {
  summary: string;
  urgency: Urgency;
  suggestedCategories: ServiceCategory[];
  questions: string[];
  briefForShop: string;
}
