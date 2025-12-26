require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/assignments", require("./routes/assignments"));
app.use("/api/execute", require("./routes/execute"));
app.use("/api/hints", require("./routes/hints"));
app.use("/api/progress", require("./routes/progress"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "CipherSQLStudio API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
