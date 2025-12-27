/**
 * User Progress Model (Shared)
 *
 * MongoDB model for tracking user progress.
 * Re-exported for serverless functions.
 *
 * Author: Gourav Chaudhary
 */

const mongoose = require("mongoose");

const UserProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    attempts: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    lastAttempt: { type: Date, default: Date.now },
    savedQuery: { type: String, default: "" },
    bestExecutionTime: { type: Number },
    hintsUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserProgressSchema.index({ userId: 1, assignmentId: 1 }, { unique: true });

module.exports =
  mongoose.models.UserProgress ||
  mongoose.model("UserProgress", UserProgressSchema);
