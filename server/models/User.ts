import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, default: "" },
  name: { type: String, default: "" },
  company: { type: String, default: "" },
  role: { type: String, default: "" },
  avatarUrl: { type: String, default: "" },
  magicToken: { type: String, default: null },
  magicTokenExpiry: { type: Date, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null },
  lastLogin: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", UserSchema);
