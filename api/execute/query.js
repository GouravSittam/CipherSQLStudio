/**
 * POST /api/execute/query - Execute SQL query
 *
 * Author: Gourav Chaudhary
 */

const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const connectDB = require("../_lib/mongodb");
const Assignment = require("../_lib/models/Assignment");
const UserProgress = require("../_lib/models/UserProgress");
const queryExecutionService = require("../_lib/queryExecutionService");
const llmService = require("../_lib/llmService");

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { assignmentId, query, sessionId } = req.body;

  if (!query || !assignmentId) {
    return res.status(400).json({
      success: false,
      message: "Assignment ID and query are required",
    });
  }

  const userSessionId = sessionId || uuidv4();

  // Extract userId from token if available
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key-change-in-production"
      );
      userId = decoded.userId;
    } catch (err) {
      // Token invalid or expired, continue as guest
      console.log("Invalid token, continuing as guest");
    }
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

    const schemaName = await queryExecutionService.createSandboxSchema(
      userSessionId
    );
    await queryExecutionService.loadSampleData(
      schemaName,
      assignment.sampleTables
    );
    const result = await queryExecutionService.executeQuery(schemaName, query);

    let isCorrect = false;
    if (result.success && assignment.expectedOutput) {
      isCorrect = await llmService.validateQuery(
        result,
        assignment.expectedOutput
      );
    }

    // Save query attempt to user progress if user is logged in
    if (userId) {
      try {
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

    // Cleanup schema after execution to avoid schema bloat
    await queryExecutionService.cleanupSchema(schemaName);

    res.json({
      success: result.success,
      data: result.rows,
      rowCount: result.rowCount,
      executionTime: result.executionTime,
      truncated: result.truncated,
      error: result.error,
      isCorrect,
      sessionId: userSessionId,
    });
  } catch (error) {
    console.error("Query execution error:", error);
    res.status(500).json({
      success: false,
      message: "Query execution failed",
      error: error.message,
    });
  }
};
