import mongoose, { Schema, Document } from "mongoose";

export interface IPerson extends Document {
  name: string;
  role: string;
  company: string;
  linkedin: string;
  createdAt: Date;
}

const PersonSchema = new Schema<IPerson>({
  name: { type: String, required: true },
  role: { type: String, default: "" },
  company: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const Person = mongoose.model<IPerson>("Person", PersonSchema);
