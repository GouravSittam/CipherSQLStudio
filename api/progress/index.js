/**
 * POST /api/progress - Save user progress
 *
 * Author: Gourav Chaudhary
 */

const connectDB = require("../_lib/mongodb");
const UserProgress = require("../_lib/models/UserProgress");

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

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
    await connectDB();

    let progress = await UserProgress.findOne({ userId, assignmentId });

    if (progress) {
      progress.attempts += 1;
      progress.lastAttempt = new Date();

      if (sqlQuery) {
        progress.savedQuery = sqlQuery;
      }

      if (isCompleted && !progress.isCompleted) {
        progress.isCompleted = true;
      }

      if (
        executionTime &&
        (!progress.bestExecutionTime ||
          executionTime < progress.bestExecutionTime)
      ) {
        progress.bestExecutionTime = executionTime;
      }

      await progress.save();
    } else {
      progress = await UserProgress.create({
        userId,
        assignmentId,
        attempts: 1,
        savedQuery: sqlQuery || "",
        isCompleted: isCompleted || false,
        bestExecutionTime: executionTime,
      });
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error("Error saving progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save progress",
      error: error.message,
    });
  }
};
