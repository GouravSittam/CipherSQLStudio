/**
 * User Progress Model
 *
 * Tracks each user's progress on assignments.
 * Stores their queries, completion status, hints used, etc.
 *
 * NOTE: Not fully integrated with frontend yet -
 * need to add user authentication first.
 *
 * Author: Gourav Chaudhary
 */

const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      // This would be auth user ID in production
      type: String,
      required: true,
      index: true,
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    sqlQuery: {
      // Their current/last query attempt
      type: String,
      default: "",
    },
    lastAttempt: {
      type: Date,
      default: Date.now,
    },
    isCompleted: {
      // Did they solve it?
      type: Boolean,
      default: false,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    hintsUsed: {
      type: Number,
      default: 0,
    },
    // Keep history of all attempts
    queryHistory: [
      {
        query: String,
        timestamp: Date,
        wasSuccessful: Boolean,
        executionTime: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Make sure each user only has one progress record per assignment
userProgressSchema.index({ userId: 1, assignmentId: 1 }, { unique: true });

module.exports = mongoose.model("UserProgress", userProgressSchema);
