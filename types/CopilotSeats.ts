import mongoose, { Schema, Document } from "mongoose";

interface Seat {
  pending_cancellation_date: boolean;
  user_id: number;
  user_login: string;
  assignment_date: string;
  last_activity_at: string;
  last_activity_editor?: string;
  created_at: string;
}

export interface ICopilotSeatsData extends Document {
  id: string;
  date: string;
  last_update: string;
  enterprise: string | null;
  organization: string | null;
  total_seats: number;
  seats: Seat[];
}

interface SeatBreakdown {
  total: number;
  active_this_cycle: number;
  inactive_this_cycle: number;
  added_this_cycle: number;
  pending_invitation: number;
  pending_cancellation: number;
}

interface SeatsManagement {
  seat_breakdown: SeatBreakdown;
  seat_management_setting: string;
  public_code_suggestions: string;
  ide_chat: string;
  platform_chat: string;
  cli: string;
  plan_type: string;
}

export interface ICopilotSeatManagementData extends Document {
  id: string;
  date: string;
  last_update: string;
  enterprise: string | null;
  organization: string | null;
  total_seats: number;
  seats: SeatsManagement;
}

const seatSchema = new Schema<Seat>({
  user_id: Number,
  user_login: String,
  assignment_date: String,
  last_activity_at: String,
  last_activity_editor: String,
  created_at: String,
});

const copilotSeatsSchema = new Schema<ICopilotSeatsData>({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  last_update: { type: String, required: true },
  enterprise: String,
  organization: String,
  total_seats: Number,
  seats: [seatSchema],
});

const seatBreakdownSchema = new Schema<SeatBreakdown>({
  total: Number,
  active_this_cycle: Number,
  inactive_this_cycle: Number,
  added_this_cycle: Number,
  pending_invitation: Number,
  pending_cancellation: Number,
});

const seatsManagementSchema = new Schema<SeatsManagement>({
  seat_breakdown: seatBreakdownSchema,
  seat_management_setting: String,
  public_code_suggestions: String,
  ide_chat: String,
  platform_chat: String,
  cli: String,
  plan_type: String,
});

const copilotSeatManagementSchema = new Schema<ICopilotSeatManagementData>({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  last_update: { type: String, required: true },
  enterprise: String,
  organization: String,
  total_seats: Number,
  seats: seatsManagementSchema,
});

// Create indexes for better query performance
copilotSeatsSchema.index({ date: 1, enterprise: 1, organization: 1 });
copilotSeatManagementSchema.index({ date: 1, enterprise: 1, organization: 1 });

export const CopilotSeats = mongoose.models.CopilotSeats || 
  mongoose.model<ICopilotSeatsData>('CopilotSeats', copilotSeatsSchema);

export const CopilotSeatManagement = mongoose.models.CopilotSeatManagement || 
  mongoose.model<ICopilotSeatManagementData>('CopilotSeatManagement', copilotSeatManagementSchema);
