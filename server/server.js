/**
 * Main server file for CipherSQLStudio
 *
 * Express server that handles:
 * - Assignment management
 * - SQL query execution
 * - LLM-powered hints
 * - User progress tracking
 *
 * Author: Gourav Chaudhary
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Connect to MongoDB (assignments are stored here)
connectDB();

// API Routes
app.use("/api/assignments", require("./routes/assignments"));
app.use("/api/execute", require("./routes/execute"));
app.use("/api/hints", require("./routes/hints"));
app.use("/api/progress", require("./routes/progress"));

// Simple health check endpoint - useful for monitoring
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "CipherSQLStudio API is running" });
});

// Global error handler
// Catches anything that slips through
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    // only show error details in dev mode
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
