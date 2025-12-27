/**
 * Assignment Routes
 *
 * CRUD operations for SQL challenges.
 * Right now we're just using GET endpoints on the frontend
 * but POST is here for when we build an admin panel.
 *
 * Author: Gourav Chaudhary
 */

const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");

/*
 * GET /api/assignments
 *
 * Returns list of all assignments
 * Can filter by difficulty or search text
 */
router.get("/", async (req, res) => {
  try {
    const { difficulty, search } = req.query;

    // Build query object based on filters
    let query = {};

    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Full-text search if search param provided
    if (search) {
      query.$text = { $search: search };
    }

    // Only return what we need for the list view
    // Don't send sample data or expected output here
    const assignments = await Assignment.find(query)
      .select("title difficulty question tags createdAt")
      .sort({ createdAt: -1 }); // newest first

    res.json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
});

/*
 * GET /api/assignments/:id
 *
 * Get full assignment details including sample tables
 * This is called when user opens a challenge
 */
router.get("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignment",
      error: error.message,
    });
  }
});

/*
 * POST /api/assignments
 *
 * Create new assignment
 * TODO: Add auth middleware - only admins should be able to do this
 */
router.post("/", async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: assignment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create assignment",
      error: error.message,
    });
  }
});

module.exports = router;
