/**
 * Query Execution Routes
 *
 * Handles running user SQL queries in isolated PostgreSQL schemas.
 * Each user gets their own sandbox so they can't interfere with others.
 *
 * Author: Gourav Chaudhary
 */

const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const Assignment = require("../models/Assignment");
const UserProgress = require("../models/UserProgress");
const queryExecutionService = require("../services/queryExecutionService");
const llmService = require("../services/llmService");

/*
 * POST /api/execute/query
 *
 * Main endpoint - runs user's SQL in their sandbox
 */
router.post("/query", async (req, res) => {
  const { assignmentId, query, sessionId } = req.body;

  // Basic validation
  if (!query || !assignmentId) {
    return res.status(400).json({
      success: false,
      message: "Assignment ID and query are required",
    });
  }

  // Use existing session or create new one
  // This lets users run multiple queries in same sandbox
  const userSessionId = sessionId || uuidv4();

  try {
    // Get the assignment to know what tables to create
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Create isolated schema for this user
    const schemaName = await queryExecutionService.createSandboxSchema(
      userSessionId
    );

    // Set up the tables with sample data
    await queryExecutionService.loadSampleData(
      schemaName,
      assignment.sampleTables
    );

    // Actually run their query
    const result = await queryExecutionService.executeQuery(schemaName, query);

    // Check if they got it right
    let isCorrect = false;
    if (result.success && assignment.expectedOutput) {
      isCorrect = await llmService.validateQuery(
        result,
        assignment.expectedOutput
      );
    }

    // Save query attempt to user progress if user is logged in
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key-change-in-production"
        );
        const userId = decoded.userId;

        const queryAttempt = {
          query: query,
          timestamp: new Date(),
          wasSuccessful: result.success && isCorrect,
          executionTime: result.executionTime,
          rowsAffected: result.rowCount,
          errorMessage: result.error || null,
        };

        await UserProgress.findOneAndUpdate(
          { userId, assignmentId },
          {
            $inc: { attempts: 1 },
            $set: {
              lastAttempt: new Date(),
              savedQuery: query,
              ...(isCorrect && { isCompleted: true }),
            },
            $push: { queryHistory: queryAttempt },
          },
          { upsert: true, new: true }
        );
      } catch (progressError) {
        console.error("Error saving user progress:", progressError);
        // Don't fail the request if progress saving fails
      }
    }

    // Could cleanup here but keeping schema alive for follow-up queries
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

/*
 * POST /api/execute/cleanup
 *
 * Cleans up a user's sandbox when they're done
 * Not used much right now but good to have
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
    // Convert session ID to schema name (dashes to underscores)
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
