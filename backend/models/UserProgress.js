const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
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
      type: String,
      default: "",
    },
    lastAttempt: {
      type: Date,
      default: Date.now,
    },
    isCompleted: {
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

// Compound index for efficient queries
userProgressSchema.index({ userId: 1, assignmentId: 1 }, { unique: true });

module.exports = mongoose.model("UserProgress", userProgressSchema);
