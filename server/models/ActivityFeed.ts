import mongoose, { Schema, Document } from "mongoose";

export interface IActivityFeed extends Document {
  type: string;
  title: string;
  description: string;
  company: string;
  createdAt: Date;
}

const ActivityFeedSchema = new Schema<IActivityFeed>({
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  company: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export const ActivityFeedModel = mongoose.model<IActivityFeed>("ActivityFeed", ActivityFeedSchema);
