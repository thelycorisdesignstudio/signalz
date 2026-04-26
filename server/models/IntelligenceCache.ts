import mongoose, { Schema, Document } from "mongoose";

export interface IIntelligenceCache extends Document {
  companyName: string;
  data: string;
  ttlHours: number;
  createdAt: Date;
}

const IntelligenceCacheSchema = new Schema<IIntelligenceCache>({
  companyName: { type: String, required: true, unique: true, lowercase: true },
  data: { type: String, required: true },
  ttlHours: { type: Number, default: 24 },
  createdAt: { type: Date, default: Date.now },
});

export const IntelligenceCache = mongoose.model<IIntelligenceCache>("IntelligenceCache", IntelligenceCacheSchema);
