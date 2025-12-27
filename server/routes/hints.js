/**
 * Hints Routes
 *
 * Uses LLM (OpenAI or Gemini) to generate helpful hints
 * for users who are stuck on a challenge.
 *
 * The prompts are engineered to give guidance without
 * just giving away the answer - we want them to learn!
 *
 * Author: Gourav Chaudhary
 */

const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
const llmService = require("../services/llmService");

/*
 * POST /api/hints
 *
 * Generate a hint based on the current challenge and user's progress
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
    // Get assignment details for context
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Ask LLM for a hint
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
      // LLM failed, use fallback hint
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
