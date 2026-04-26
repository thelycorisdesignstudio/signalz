import mongoose, { Schema, Document } from "mongoose";

export interface IEmailCache extends Document {
  cacheKey: string;
  data: string;
  createdAt: Date;
}

const EmailCacheSchema = new Schema<IEmailCache>({
  cacheKey: { type: String, required: true, unique: true },
  data: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const EmailCache = mongoose.model<IEmailCache>("EmailCache", EmailCacheSchema);
