/**
 * User Progress API - Get Query History
 *
 * GET /api/progress/history/:assignmentId
 * Returns user's query history for a specific assignment.
 *
 * Author: Gourav Chaudhary
 */

const connectDB = require("../_lib/mongodb");
const UserProgress = require("../_lib/models/UserProgress");
const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    await connectDB();

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
      attempts: progress.attempts,
      isCompleted: progress.isCompleted,
      lastAttempt: progress.lastAttempt,
      savedQuery: progress.savedQuery,
    });
  } catch (error) {
    console.error("Get query history error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
