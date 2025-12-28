/**
 * Progress Routes
 *
 * Endpoints for saving/loading user progress.
 * Right now this is more of a foundation - need auth
 * to properly track users.
 *
 * Author: Gourav Chaudhary
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const UserProgress = require("../models/UserProgress");

/*
 * GET /api/progress/history
 *
 * Get query history for a specific assignment (authenticated)
 */
router.get("/history", async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key-change-in-production"
      );
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { assignmentId } = req.query;

    if (!assignmentId) {
      return res.status(400).json({ error: "Assignment ID is required" });
    }

    // Get user progress for this assignment
    const progress = await UserProgress.findOne({
      userId: decoded.userId,
      assignmentId,
    }).select("queryHistory attempts isCompleted lastAttempt savedQuery");

    if (!progress) {
      return res.status(200).json({
        success: true,
        queryHistory: [],
        attempts: 0,
        isCompleted: false,
      });
    }

    res.status(200).json({
      success: true,
      queryHistory: progress.queryHistory || [],
      attempts: progress.attempts || progress.attemptCount || 0,
      isCompleted: progress.isCompleted,
      lastAttempt: progress.lastAttempt,
      savedQuery: progress.savedQuery || progress.sqlQuery,
    });
  } catch (error) {
    console.error("Get query history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/*
 * GET /api/progress/:userId
 *
 * Get all progress for a user across all assignments
 */
router.get("/:userId", async (req, res) => {
  try {
    const progress = await UserProgress.find({ userId: req.params.userId })
      .populate("assignmentId", "title difficulty")
      .sort({ lastAttempt: -1 }); // most recent first

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
      error: error.message,
    });
  }
});

/*
 * GET /api/progress/:userId/:assignmentId
 *
 * Get progress for a specific assignment
 */
router.get("/:userId/:assignmentId", async (req, res) => {
  try {
    const progress = await UserProgress.findOne({
      userId: req.params.userId,
      assignmentId: req.params.assignmentId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress not found",
      });
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
      error: error.message,
    });
  }
});

/*
 * POST /api/progress
 *
 * Save or update progress
 * Creates new record if doesn't exist, updates if it does
 */
router.post("/", async (req, res) => {
  const {
    userId,
    assignmentId,
    sqlQuery,
    isCompleted,
    executionTime,
    wasSuccessful,
  } = req.body;

  // Basic validation
  if (!userId || !assignmentId) {
    return res.status(400).json({
      success: false,
      message: "User ID and Assignment ID are required",
    });
  }

  try {
    // Check if we already have progress for this user/assignment combo
    let progress = await UserProgress.findOne({ userId, assignmentId });

    if (progress) {
      // Update existing record
      progress.sqlQuery = sqlQuery || progress.sqlQuery;
      progress.lastAttempt = new Date();
      progress.attemptCount += 1;

      // Once completed, always completed
      if (isCompleted) {
        progress.isCompleted = true;
      }

      // Log this attempt
      progress.queryHistory.push({
        query: sqlQuery,
        timestamp: new Date(),
        wasSuccessful: wasSuccessful || false,
        executionTime: executionTime || 0,
      });

      await progress.save();
    } else {
      // First attempt - create new record
      progress = await UserProgress.create({
        userId,
        assignmentId,
        sqlQuery: sqlQuery || "",
        attemptCount: 1,
        isCompleted: isCompleted || false,
        queryHistory: [
          {
            query: sqlQuery,
            timestamp: new Date(),
            wasSuccessful: wasSuccessful || false,
            executionTime: executionTime || 0,
          },
        ],
      });
    }

    res.json({
      success: true,
      message: "Progress saved successfully",
      data: progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save progress",
      error: error.message,
    });
  }
});

module.exports = router;
