const express = require("express");
const router = express.Router();
const UserProgress = require("../models/UserProgress");

/**
 * GET /api/progress/:userId
 * Get user's progress for all assignments
 */
router.get("/:userId", async (req, res) => {
  try {
    const progress = await UserProgress.find({ userId: req.params.userId })
      .populate("assignmentId", "title difficulty")
      .sort({ lastAttempt: -1 });

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

/**
 * GET /api/progress/:userId/:assignmentId
 * Get user's progress for specific assignment
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

/**
 * POST /api/progress
 * Save or update user's progress
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

  if (!userId || !assignmentId) {
    return res.status(400).json({
      success: false,
      message: "User ID and Assignment ID are required",
    });
  }

  try {
    let progress = await UserProgress.findOne({ userId, assignmentId });

    if (progress) {
      // Update existing progress
      progress.sqlQuery = sqlQuery || progress.sqlQuery;
      progress.lastAttempt = new Date();
      progress.attemptCount += 1;

      if (isCompleted) {
        progress.isCompleted = true;
      }

      // Add to query history
      progress.queryHistory.push({
        query: sqlQuery,
        timestamp: new Date(),
        wasSuccessful: wasSuccessful || false,
        executionTime: executionTime || 0,
      });

      await progress.save();
    } else {
      // Create new progress
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
