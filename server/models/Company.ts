import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  name: string;
  industry: string;
  website: string;
  status: string;
  intentScore: number;
  employees: string;
  lastActivity: Date;
  createdAt: Date;
}

const CompanySchema = new Schema<ICompany>({
  name: { type: String, required: true },
  industry: { type: String, default: "" },
  website: { type: String, default: "" },
  status: { type: String, default: "Research", enum: ["Research", "Active", "Nurture", "Closed"] },
  intentScore: { type: Number, default: 50 },
  employees: { type: String, default: "" },
  lastActivity: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export const Company = mongoose.model<ICompany>("Company", CompanySchema);
