import mongoose, { Schema, Document } from "mongoose";

export interface ILead extends Document {
  name: string;
  title: string;
  company: string;
  email: string;
  linkedin: string;
  score: number;
  status: string;
  notes: string;
  createdAt: Date;
}

const LeadSchema = new Schema<ILead>({
  name: { type: String, required: true },
  title: { type: String, default: "" },
  company: { type: String, default: "" },
  email: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  score: { type: Number, default: 50 },
  status: { type: String, default: "New", enum: ["New", "Contacted", "Replied", "Meeting Booked", "Qualified", "Disqualified"] },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const Lead = mongoose.model<ILead>("Lead", LeadSchema);
