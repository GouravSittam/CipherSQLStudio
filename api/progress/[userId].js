/**
 * GET /api/progress/[userId] - Get user progress
 *
 * Author: Gourav Chaudhary
 */

const connectDB = require("../_lib/mongodb");
const UserProgress = require("../_lib/models/UserProgress");

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { userId } = req.query;

  try {
    await connectDB();

    const progress = await UserProgress.find({ userId })
      .populate("assignmentId", "title difficulty")
      .sort({ lastAttempt: -1 });

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
      error: error.message,
    });
  }
};
