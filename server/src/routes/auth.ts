/**
 * Authentication Routes
 *
 * POST /api/auth/signup  - register a new user
 * POST /api/auth/login   - log in with email + password
 * GET  /api/auth/me      - current user (requires token)
 *
 * Author: Gourav Chaudhary
 */

import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { HttpError, parse } from "../lib/http.js";
import { currentUser, requireAuth, signToken } from "../middleware/auth.js";
import { UserModel, toPublicUser } from "../models/User.js";

const router = Router();

const required = "Username, email, and password are required";

const signupSchema = z.object({
  username: z
    .string({ error: required })
    .trim()
    .min(1, required)
    .min(3, "Username must be between 3 and 30 characters")
    .max(30, "Username must be between 3 and 30 characters"),
  email: z.string({ error: required }).trim().toLowerCase().min(1, required).pipe(z.email("Please enter a valid email address")),
  password: z.string({ error: required }).min(1, required).min(6, "Password must be at least 6 characters long"),
  fullName: z.string().trim().max(100).optional().default(""),
});

const loginSchema = z.object({
  email: z.string({ error: "Email and password are required" }).trim().toLowerCase().min(1, "Email and password are required"),
  password: z.string({ error: "Email and password are required" }).min(1, "Email and password are required"),
});

router.post("/signup", async (req, res) => {
  const { username, email, password, fullName } = parse(signupSchema, req.body);

  const existing = await UserModel.findOne({ $or: [{ email }, { username }] });
  if (existing?.email === email) throw new HttpError(409, "Email already registered");
  if (existing?.username === username) throw new HttpError(409, "Username already taken");

  const user = await UserModel.create({
    username,
    email,
    password: await bcrypt.hash(password, 10),
    fullName,
  });

  res.status(201).json({ success: true, token: signToken(user), user: toPublicUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = parse(loginSchema, req.body);

  const user = await UserModel.findOne({ email }).select("+password");
  // Same message for unknown email and wrong password - don't leak which one
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, "Invalid credentials");
  }
  if (!user.isActive) throw new HttpError(403, "Account is deactivated");

  res.json({ success: true, token: signToken(user), user: toPublicUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await UserModel.findById(currentUser(req).userId);
  if (!user) throw new HttpError(404, "User not found");
  if (!user.isActive) throw new HttpError(403, "Account is deactivated");

  res.json({ success: true, user: toPublicUser(user) });
});

export default router;
