/**
 * POST /api/hints - Generate hint for assignment
 *
 * Author: Gourav Chaudhary
 */

const connectDB = require("../_lib/mongodb");
const Assignment = require("../_lib/models/Assignment");
const llmService = require("../_lib/llmService");

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

  const { assignmentId, currentQuery, previousHints } = req.body;

  if (!assignmentId) {
    return res.status(400).json({
      success: false,
      message: "Assignment ID is required",
    });
  }

  try {
    await connectDB();

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const hintResult = await llmService.generateHint(
      assignment,
      currentQuery || "",
      previousHints || []
    );

    res.json({
      success: true,
      hint: hintResult.hint,
      usingFallback: hintResult.fallbackHint || false,
    });
  } catch (error) {
    console.error("Hint generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate hint",
      error: error.message,
    });
  }
};
