import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "signalz-secret-change-in-prod";
const JWT_EXPIRES = "7d";

function signToken(userId: string, email: string) {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function sanitizeUser(user: any) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    company: user.company,
    role: user.role,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
}

// ============ Register ============
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, company } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: "An account with this email already exists" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name: name || "",
      company: company || "",
      lastLogin: new Date(),
    });

    const token = signToken(user._id.toString(), user.email);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err: any) {
    res.status(500).json({ error: "Registration failed: " + err.message });
  }
});

// ============ Login ============
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id.toString(), user.email);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err: any) {
    res.status(500).json({ error: "Login failed: " + err.message });
  }
});

// ============ Magic Link - Request ============
router.post("/magic-link", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({ email: email.toLowerCase() });
    }

    const magicToken = crypto.randomBytes(32).toString("hex");
    user.magicToken = magicToken;
    user.magicTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // In production, send this via email. For now return the token.
    const magicLink = `${process.env.APP_URL || "http://localhost:5000"}/auth/magic/${magicToken}`;
    console.log(`[auth] Magic link for ${email}: ${magicLink}`);

    res.json({ ok: true, message: "Magic link sent to your email", magicLink });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate magic link: " + err.message });
  }
});

// ============ Magic Link - Verify ============
router.get("/verify-magic/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      magicToken: token,
      magicTokenExpiry: { $gt: new Date() },
    });

    if (!user) return res.status(401).json({ error: "Invalid or expired magic link" });

    user.magicToken = null;
    user.magicTokenExpiry = null;
    user.lastLogin = new Date();
    await user.save();

    const jwt = signToken(user._id.toString(), user.email);
    res.json({ token: jwt, user: sanitizeUser(user) });
  } catch (err: any) {
    res.status(500).json({ error: "Verification failed: " + err.message });
  }
});

// ============ Forgot Password ============
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ ok: true, message: "If an account exists, a reset link has been sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetLink = `${process.env.APP_URL || "http://localhost:5000"}/auth/reset/${resetToken}`;
    console.log(`[auth] Password reset for ${email}: ${resetLink}`);

    res.json({ ok: true, message: "If an account exists, a reset link has been sent", resetLink });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to process reset request: " + err.message });
  }
});

// ============ Reset Password ============
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "Token and new password are required" });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) return res.status(401).json({ error: "Invalid or expired reset link" });

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    const jwt = signToken(user._id.toString(), user.email);
    res.json({ token: jwt, user: sanitizeUser(user), message: "Password reset successful" });
  } catch (err: any) {
    res.status(500).json({ error: "Password reset failed: " + err.message });
  }
});

// ============ Get Current User ============
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as any;
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user: sanitizeUser(user) });
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

// ============ Update Profile ============
router.put("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as any;
    const { name, company, role } = req.body;

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { name, company, role },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user: sanitizeUser(user) });
  } catch (err: any) {
    res.status(500).json({ error: "Profile update failed: " + err.message });
  }
});

export default router;
