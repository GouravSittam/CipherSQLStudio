const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");

/**
 * GET /api/assignments
 * Get all assignments with basic info
 */
router.get("/", async (req, res) => {
  try {
    const { difficulty, search } = req.query;

    let query = {};

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const assignments = await Assignment.find(query)
      .select("title difficulty question tags createdAt")
      .sort({ createdAt: -1 });

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

/**
 * GET /api/assignments/:id
 * Get single assignment with full details including sample data
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

/**
 * POST /api/assignments
 * Create new assignment (Admin only - in production, add auth middleware)
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
