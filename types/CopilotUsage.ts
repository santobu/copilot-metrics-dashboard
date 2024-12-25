import mongoose, { Schema, Document } from "mongoose";

interface IBreakdown {
  language: string;
  editor: string;
  suggestions_count: number;
  acceptances_count: number;
  lines_suggested: number;
  lines_accepted: number;
  active_users: number;
}

export interface ICopilotUsage extends Document {
  total_suggestions_count: number;
  total_acceptances_count: number;
  total_lines_suggested: number;
  total_lines_accepted: number;
  total_active_users: number;
  total_chat_acceptances: number;
  total_chat_turns: number;
  total_active_chat_users: number;
  day: string;
  breakdown: IBreakdown[];
  time_frame_week?: string;
  time_frame_month?: string;
  time_frame_display?: string;
}

const breakdownSchema = new Schema<IBreakdown>({
  language: { type: String, required: true },
  editor: { type: String, required: true },
  suggestions_count: { type: Number, required: true },
  acceptances_count: { type: Number, required: true },
  lines_suggested: { type: Number, required: true },
  lines_accepted: { type: Number, required: true },
  active_users: { type: Number, required: true },
});

const copilotUsageSchema = new Schema<ICopilotUsage>({
  total_suggestions_count: { type: Number, required: true },
  total_acceptances_count: { type: Number, required: true },
  total_lines_suggested: { type: Number, required: true },
  total_lines_accepted: { type: Number, required: true },
  total_active_users: { type: Number, required: true },
  total_chat_acceptances: { type: Number, required: true },
  total_chat_turns: { type: Number, required: true },
  total_active_chat_users: { type: Number, required: true },
  day: { type: String, required: true, index: true },
  breakdown: [breakdownSchema],
  time_frame_week: String,
  time_frame_month: String,
  time_frame_display: String,
});

// Create an index on the day field for better query performance
// copilotUsageSchema.index({ day: 1 });

export const CopilotUsage = mongoose.models.CopilotUsage || 
  mongoose.model<ICopilotUsage>('CopilotUsage', copilotUsageSchema);
