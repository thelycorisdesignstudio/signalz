import mongoose, { Schema, Document } from "mongoose";

export interface IEmailTemplate extends Document {
  name: string;
  subject: string;
  body: string;
  company: string;
  createdAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  company: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const EmailTemplate = mongoose.model<IEmailTemplate>("EmailTemplate", EmailTemplateSchema);
