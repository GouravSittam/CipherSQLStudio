/**
 * User Model (Shared)
 *
 * MongoDB model for user authentication and profile.
 * Stores user credentials and basic profile information.
 *
 * Author: Gourav Chaudhary
 */

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
