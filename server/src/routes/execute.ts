/**
 * Query Execution Routes
 *
 * POST /api/execute/query - run a user's SQL against an assignment's sample data,
 * check it against the expected output and (for logged-in users) record the attempt.
 *
 * Author: Gourav Chaudhary
 */

import { Router } from "express";
import { z } from "zod";
import { HttpError, objectId, parse } from "../lib/http.js";
import { optionalAuth } from "../middleware/auth.js";
import { AssignmentModel } from "../models/Assignment.js";
import { UserProgressModel } from "../models/UserProgress.js";
import { isCorrectAnswer } from "../services/grading.js";
import { runInSandbox } from "../services/sandbox.js";

const router = Router();

const executeSchema = z.object({
  assignmentId: objectId("Assignment ID"),
  query: z
    .string({ error: "Assignment ID and query are required" })
    .min(1, "Assignment ID and query are required")
    .max(10_000, "Query is too long"),
});

router.post("/query", optionalAuth, async (req, res) => {
  const { assignmentId, query } = parse(executeSchema, req.body);

  const assignment = await AssignmentModel.findById(assignmentId).lean();
  if (!assignment) throw new HttpError(404, "Assignment not found");

  const result = await runInSandbox(assignment.sampleTables, query);
  const isCorrect = result.success && isCorrectAnswer(result.rows, assignment.expectedOutput);

  if (req.user) {
    const now = new Date();
    try {
      await UserProgressModel.updateOne(
        { userId: req.user.userId, assignmentId },
        {
          $inc: { attempts: 1 },
          $set: { lastAttempt: now, savedQuery: query, ...(isCorrect && { isCompleted: true }) },
          ...(isCorrect && { $min: { bestExecutionTime: result.executionTime } }),
          $push: {
            queryHistory: {
              query,
              timestamp: now,
              wasSuccessful: isCorrect,
              executionTime: result.executionTime,
              rowsAffected: result.success ? result.rowCount : undefined,
              errorMessage: result.success ? undefined : result.error,
            },
          },
        },
        { upsert: true },
      );
    } catch (error) {
      // Saving progress must never fail the query itself
      console.error("Error saving user progress:", error);
    }
  }

  res.json(
    result.success
      ? {
          success: true,
          data: result.rows,
          rowCount: result.rowCount,
          executionTime: result.executionTime,
          truncated: result.truncated,
          isCorrect,
        }
      : { success: false, error: result.error, executionTime: result.executionTime, isCorrect: false },
  );
});

export default router;
