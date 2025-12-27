/**
 * Assignment Model
 *
 * Schema for SQL challenges stored in MongoDB.
 * Each assignment has:
 * - Basic info (title, difficulty, question)
 * - Sample tables with data
 * - Expected output for validation
 * - Tags for filtering
 *
 * Author: Gourav Chaudhary
 */

const mongoose = require("mongoose");

// Schema for table columns
const columnSchema = new mongoose.Schema(
  {
    columnName: {
      type: String,
      required: true,
    },
    dataType: {
      type: String,
      required: true,
      // These map to PostgreSQL types
      enum: [
        "INTEGER",
        "TEXT",
        "REAL",
        "BOOLEAN",
        "DATE",
        "TIMESTAMP",
        "VARCHAR",
      ],
    },
  },
  { _id: false }
); // Don't need _id for sub-docs

// Schema for sample tables
const sampleTableSchema = new mongoose.Schema(
  {
    tableName: {
      type: String,
      required: true,
    },
    columns: [columnSchema],
    rows: {
      // 2D array - each row is an array of values
      type: [[mongoose.Schema.Types.Mixed]],
      default: [],
    },
  },
  { _id: false }
);

// Main assignment schema
const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
    },
    question: {
      type: String,
      required: true,
    },
    sampleTables: [sampleTableSchema],
    expectedOutput: {
      type: {
        type: String,
        enum: ["table", "single_value", "column", "count", "row"],
        required: true,
      },
      value: mongoose.Schema.Types.Mixed,
    },
    hints: {
      // Pre-defined hints (optional, we mostly use LLM now)
      type: [String],
      default: [],
    },
    tags: {
      // For filtering (e.g., "JOIN", "GROUP BY", "subquery")
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Indexes for faster queries
assignmentSchema.index({ difficulty: 1, createdAt: -1 });
assignmentSchema.index({ title: "text", question: "text" }); // for search

module.exports = mongoose.model("Assignment", assignmentSchema);
