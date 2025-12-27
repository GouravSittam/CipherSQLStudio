/**
 * POST /api/execute/query - Execute SQL query
 *
 * Author: Gourav Chaudhary
 */

const { v4: uuidv4 } = require("uuid");
const connectDB = require("../_lib/mongodb");
const Assignment = require("../_lib/models/Assignment");
const queryExecutionService = require("../_lib/queryExecutionService");
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

  const { assignmentId, query, sessionId } = req.body;

  if (!query || !assignmentId) {
    return res.status(400).json({
      success: false,
      message: "Assignment ID and query are required",
    });
  }

  const userSessionId = sessionId || uuidv4();

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
