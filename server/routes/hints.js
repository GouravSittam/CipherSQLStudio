const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
const llmService = require("../services/llmService");

/**
 * POST /api/hints
 * Generate hint for assignment using LLM
 */
router.post("/", async (req, res) => {
  const { assignmentId, currentQuery, previousHints } = req.body;

  if (!assignmentId) {
    return res.status(400).json({
      success: false,
      message: "Assignment ID is required",
    });
  }

  try {
    // Fetch assignment
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Generate hint using LLM
    const hintResult = await llmService.generateHint(
      assignment,
      currentQuery || "",
      previousHints || []
    );

    if (hintResult.success) {
      res.json({
        success: true,
        hint: hintResult.hint,
      });
    } else {
      res.json({
        success: true,
        hint: hintResult.fallbackHint,
        usingFallback: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate hint",
      error: error.message,
    });
  }
});

module.exports = router;
