/**
 * Assignment Routes
 *
 * GET  /api/assignments      - list challenges (filter by difficulty / search)
 * GET  /api/assignments/:id  - full challenge incl. sample tables
 * POST /api/assignments      - create a challenge (admins only)
 *
 * Author: Gourav Chaudhary
 */

import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { HttpError, parse } from "../lib/http.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { AssignmentModel, DIFFICULTIES } from "../models/Assignment.js";

const router = Router();

const listQuerySchema = z.object({
  difficulty: z.enum(DIFFICULTIES).optional(),
  search: z.string().trim().max(200).optional(),
});

router.get("/", async (req, res) => {
  const { difficulty, search } = parse(listQuerySchema, req.query);

  const filter: Record<string, unknown> = {};
  if (difficulty) filter.difficulty = difficulty;
  if (search) filter.$text = { $search: search };

  // Only what the list view needs - no sample data or expected output
  const assignments = await AssignmentModel.find(filter)
    .select("title difficulty question tags createdAt")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, count: assignments.length, data: assignments });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new HttpError(404, "Assignment not found");

  // Never send the expected output to the browser - it is the answer key
  const assignment = await AssignmentModel.findById(id).select("-expectedOutput").lean();
  if (!assignment) throw new HttpError(404, "Assignment not found");

  res.json({ success: true, data: assignment });
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const assignment = await AssignmentModel.create(req.body);
    res.status(201).json({ success: true, message: "Assignment created successfully", data: assignment });
  } catch (error) {
    throw new HttpError(400, error instanceof Error ? error.message : "Failed to create assignment");
  }
});

export default router;
