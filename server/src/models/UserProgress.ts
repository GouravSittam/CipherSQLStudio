/**
 * User Progress Model
 *
 * Tracks each user's progress on an assignment: attempts, completion status,
 * last saved query and the full history of query attempts.
 *
 * Author: Gourav Chaudhary
 */

import { Schema, model, type Types } from "mongoose";

export interface QueryAttempt {
  query: string;
  timestamp: Date;
  wasSuccessful: boolean;
  executionTime?: number;
  rowsAffected?: number;
  errorMessage?: string;
}

export interface UserProgress {
  userId: string;
  assignmentId: Types.ObjectId;
  attempts: number;
  isCompleted: boolean;
  lastAttempt: Date;
  savedQuery: string;
  bestExecutionTime?: number;
  hintsUsed: number;
  queryHistory: QueryAttempt[];
  createdAt?: Date;
  updatedAt?: Date;
}

const queryAttemptSchema = new Schema<QueryAttempt>({
  query: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  wasSuccessful: { type: Boolean, default: false },
  executionTime: { type: Number },
  rowsAffected: { type: Number },
  errorMessage: { type: String },
});

const userProgressSchema = new Schema<UserProgress>(
  {
    userId: { type: String, required: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    attempts: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    lastAttempt: { type: Date, default: Date.now },
    savedQuery: { type: String, default: "" },
    bestExecutionTime: { type: Number },
    hintsUsed: { type: Number, default: 0 },
    queryHistory: { type: [queryAttemptSchema], default: [] },
  },
  { timestamps: true },
);

// One progress record per user per assignment
userProgressSchema.index({ userId: 1, assignmentId: 1 }, { unique: true });

export const UserProgressModel = model<UserProgress>("UserProgress", userProgressSchema);
