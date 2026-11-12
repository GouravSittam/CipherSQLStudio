/**
 * Hint Routes
 *
 * POST /api/hints - AI hint for the current challenge and the student's query.
 *
 * Author: Gourav Chaudhary
 */

import { Router } from "express";
import { z } from "zod";
import { HttpError, objectId, parse } from "../lib/http.js";
import { optionalAuth } from "../middleware/auth.js";
import { AssignmentModel } from "../models/Assignment.js";
import { UserProgressModel } from "../models/UserProgress.js";
import { generateHint } from "../services/hints.js";

const router = Router();

const hintSchema = z.object({
  assignmentId: objectId("Assignment ID"),
  currentQuery: z.string().max(10_000).optional().default(""),
  previousHints: z.array(z.string().max(2_000)).max(20).optional().default([]),
});

router.post("/", optionalAuth, async (req, res) => {
  const { assignmentId, currentQuery, previousHints } = parse(hintSchema, req.body);

  const assignment = await AssignmentModel.findById(assignmentId).lean();
  if (!assignment) throw new HttpError(404, "Assignment not found");

  const { hint, usingFallback } = await generateHint(assignment, currentQuery, previousHints);

  if (req.user) {
    await UserProgressModel.updateOne(
      { userId: req.user.userId, assignmentId },
      { $inc: { hintsUsed: 1 } },
      { upsert: true },
    ).catch((error: unknown) => console.error("Error recording hint usage:", error));
  }

  res.json({ success: true, hint, usingFallback });
});

export default router;
