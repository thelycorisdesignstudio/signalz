import mongoose, { Schema, Document } from "mongoose";

export interface ICompanyNote extends Document {
  companyId: string;
  notes: string;
  updatedAt: Date;
}

const CompanyNoteSchema = new Schema<ICompanyNote>({
  companyId: { type: String, required: true, unique: true },
  notes: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});

export const CompanyNote = mongoose.model<ICompanyNote>("CompanyNote", CompanyNoteSchema);
