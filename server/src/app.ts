/**
 * CipherSQLStudio API (Express 5)
 *
 * One app, two ways to run it:
 * - locally via server/src/index.ts (long-running server)
 * - on Vercel via api/index.ts (serverless function)
 *
 * Handles:
 * - Authentication
 * - Assignment management
 * - SQL query execution in a PostgreSQL sandbox
 * - AI-powered hints
 * - User progress tracking
 *
 * Author: Gourav Chaudhary
 */

import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { connectDB } from "./db/mongo.js";
import { errorHandler, notFound } from "./lib/http.js";
import assignmentRoutes from "./routes/assignments.js";
import authRoutes from "./routes/auth.js";
import executeRoutes from "./routes/execute.js";
import hintRoutes from "./routes/hints.js";
import progressRoutes from "./routes/progress.js";

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",").map((origin) => origin.trim()) : "*",
  }),
);
app.use(express.json({ limit: "100kb" }));

// Health check - doesn't touch the database, useful for uptime monitoring
app.get(["/health", "/api/health"], (_req, res) => {
  res.json({
    status: "OK",
    message: "CipherSQLStudio API is running",
    timestamp: new Date().toISOString(),
  });
});

// Make sure MongoDB is connected before any API route runs (cached after the first call)
app.use("/api", async (_req, _res, next) => {
  await connectDB();
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/execute", executeRoutes);
app.use("/api/hints", hintRoutes);
app.use("/api/progress", progressRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
