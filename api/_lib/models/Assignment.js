/**
 * Assignment Model (Shared)
 *
 * MongoDB model for SQL assignments/challenges.
 * Re-exported for serverless functions.
 *
 * Author: Gourav Chaudhary
 */

const mongoose = require("mongoose");

const ColumnSchema = new mongoose.Schema({
  columnName: { type: String, required: true },
  dataType: { type: String, required: true },
});

const TableSchema = new mongoose.Schema({
  tableName: { type: String, required: true },
  columns: [ColumnSchema],
  rows: [[mongoose.Schema.Types.Mixed]],
});

const AssignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    question: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    sampleTables: [TableSchema],
    expectedOutput: {
      columns: [String],
      rows: [[mongoose.Schema.Types.Mixed]],
    },
    tags: [String],
    hints: [String],
  },
  { timestamps: true }
);

AssignmentSchema.index({ title: "text", question: "text" });

module.exports =
  mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema);
