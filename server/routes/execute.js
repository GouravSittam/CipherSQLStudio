const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Assignment = require("../models/Assignment");
const queryExecutionService = require("../services/queryExecutionService");
const llmService = require("../services/llmService");

/**
 * POST /api/execute/query
 * Execute SQL query in sandbox environment
 */
router.post("/query", async (req, res) => {
  const { assignmentId, query, sessionId } = req.body;

  if (!query || !assignmentId) {
    return res.status(400).json({
      success: false,
      message: "Assignment ID and query are required",
    });
  }

  // Generate or use existing session ID for schema isolation
  const userSessionId = sessionId || uuidv4();

  try {
    // Fetch assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Create sandbox schema
    const schemaName = await queryExecutionService.createSandboxSchema(
      userSessionId
    );

    // Load sample data
    await queryExecutionService.loadSampleData(
      schemaName,
      assignment.sampleTables
    );

    // Execute query
    const result = await queryExecutionService.executeQuery(schemaName, query);

    // Check if query matches expected output
    let isCorrect = false;
    if (result.success && assignment.expectedOutput) {
      isCorrect = await llmService.validateQuery(
        result,
        assignment.expectedOutput
      );
    }

    // Optional: Cleanup schema after execution (or keep for session)
    // await queryExecutionService.cleanupSchema(schemaName);

    res.json({
      success: result.success,
      data: result.rows,
      rowCount: result.rowCount,
      executionTime: result.executionTime,
      truncated: result.truncated,
      error: result.error,
      isCorrect,
      sessionId: userSessionId,
      schemaName,
    });
  } catch (error) {
    console.error("❌ Query execution error:", error);
    res.status(500).json({
      success: false,
      message: "Query execution failed",
      error: error.message,
    });
  }
});

/**
 * POST /api/execute/cleanup
 * Cleanup user's sandbox schema
 */
router.post("/cleanup", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: "Session ID is required",
    });
  }

  try {
    const schemaName = `workspace_${sessionId.replace(/-/g, "_")}`;
    await queryExecutionService.cleanupSchema(schemaName);

    res.json({
      success: true,
      message: "Sandbox cleaned up successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cleanup failed",
      error: error.message,
    });
  }
});

module.exports = router;
