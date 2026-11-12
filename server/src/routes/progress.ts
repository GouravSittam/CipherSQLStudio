/**
 * Progress Routes (all require a logged-in user)
 *
 * GET  /api/progress/history?assignmentId=…  - query history for one assignment
 * GET  /api/progress/:userId                 - all progress for a user
 * GET  /api/progress/:userId/:assignmentId   - progress for one assignment
 * POST /api/progress                         - save progress manually
 *
 * Users can only read and write their own progress (admins can read anyone's).
 *
 * Author: Gourav Chaudhary
 */

import { Router, type Request } from "express";
import { z } from "zod";
import { HttpError, objectId, parse } from "../lib/http.js";
import { currentUser, requireAuth } from "../middleware/auth.js";
import { UserProgressModel } from "../models/UserProgress.js";

const router = Router();
router.use(requireAuth);

function assertCanRead(req: Request, userId: string): void {
  const user = currentUser(req);
  if (user.userId !== userId && user.role !== "admin") {
    throw new HttpError(403, "You can only view your own progress");
  }
}

router.get("/history", async (req, res) => {
  const { assignmentId } = parse(z.object({ assignmentId: objectId("Assignment ID") }), req.query);

  const progress = await UserProgressModel.findOne({ userId: currentUser(req).userId, assignmentId })
    .select("queryHistory attempts isCompleted lastAttempt savedQuery")
    .lean();

  res.json({
    success: true,
    queryHistory: progress?.queryHistory ?? [],
    attempts: progress?.attempts ?? 0,
    isCompleted: progress?.isCompleted ?? false,
    lastAttempt: progress?.lastAttempt,
    savedQuery: progress?.savedQuery ?? "",
  });
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  assertCanRead(req, userId);

  const progress = await UserProgressModel.find({ userId })
    .select("-queryHistory")
    .populate("assignmentId", "title difficulty")
    .sort({ lastAttempt: -1 })
    .lean();

  res.json({ success: true, data: progress });
});

router.get("/:userId/:assignmentId", async (req, res) => {
  const { userId, assignmentId } = req.params;
  assertCanRead(req, userId);
  parse(objectId("Assignment ID"), assignmentId);

  const progress = await UserProgressModel.findOne({ userId, assignmentId }).lean();
  if (!progress) throw new HttpError(404, "Progress not found");

  res.json({ success: true, data: progress });
});

const saveSchema = z.object({
  assignmentId: objectId("Assignment ID"),
  sqlQuery: z.string().max(10_000).optional(),
  isCompleted: z.boolean().optional(),
  executionTime: z.number().nonnegative().optional(),
});

router.post("/", async (req, res) => {
  const { assignmentId, sqlQuery, isCompleted, executionTime } = parse(saveSchema, req.body);

  const progress = await UserProgressModel.findOneAndUpdate(
    { userId: currentUser(req).userId, assignmentId },
    {
      $inc: { attempts: 1 },
      $set: {
        lastAttempt: new Date(),
        ...(sqlQuery !== undefined && { savedQuery: sqlQuery }),
        // Once completed, always completed
        ...(isCompleted && { isCompleted: true }),
      },
      ...(executionTime !== undefined && { $min: { bestExecutionTime: executionTime } }),
    },
    { upsert: true, returnDocument: "after" },
  ).lean();

  res.json({ success: true, message: "Progress saved successfully", data: progress });
});

export default router;
