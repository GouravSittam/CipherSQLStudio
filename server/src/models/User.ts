/**
 * User Model
 *
 * Stores user credentials and basic profile information.
 * Passwords are bcrypt hashes and are never selected by default.
 *
 * Author: Gourav Chaudhary
 */

import { Schema, model, type HydratedDocument } from "mongoose";

export const ROLES = ["student", "admin"] as const;
export type Role = (typeof ROLES)[number];

export interface User {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<User>(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    fullName: { type: String, trim: true, default: "" },
    role: { type: String, enum: ROLES, default: "student" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Note: email and username indexes are created automatically by `unique: true`

export type UserDocument = HydratedDocument<User>;

export const UserModel = model<User>("User", userSchema);

/** The public shape of a user returned by the API (never includes the password). */
export function toPublicUser(user: UserDocument) {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    fullName: user.fullName ?? "",
    role: user.role,
  };
}
