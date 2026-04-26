import mongoose, { Schema, Document } from "mongoose";

export interface ISequenceStep {
  type: "email" | "linkedin" | "followup" | "call";
  label: string;
  day: number;
  subject?: string;
  content?: string;
}

export interface ISequence extends Document {
  name: string;
  steps: ISequenceStep[];
  activeContacts: number;
  replied: number;
  bounced: number;
  status: string;
  createdAt: Date;
}

const SequenceStepSchema = new Schema<ISequenceStep>({
  type: { type: String, required: true, enum: ["email", "linkedin", "followup", "call"] },
  label: { type: String, required: true },
  day: { type: Number, default: 1 },
  subject: { type: String, default: "" },
  content: { type: String, default: "" },
}, { _id: false });

const SequenceSchema = new Schema<ISequence>({
  name: { type: String, required: true },
  steps: { type: [SequenceStepSchema], default: [] },
  activeContacts: { type: Number, default: 0 },
  replied: { type: Number, default: 0 },
  bounced: { type: Number, default: 0 },
  status: { type: String, default: "Draft", enum: ["Active", "Paused", "Draft"] },
  createdAt: { type: Date, default: Date.now },
});

export const Sequence = mongoose.model<ISequence>("Sequence", SequenceSchema);
