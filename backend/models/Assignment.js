const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema(
  {
    columnName: {
      type: String,
      required: true,
    },
    dataType: {
      type: String,
      required: true,
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
);

const sampleTableSchema = new mongoose.Schema(
  {
    tableName: {
      type: String,
      required: true,
    },
    columns: [columnSchema],
    rows: {
      type: [[mongoose.Schema.Types.Mixed]],
      default: [],
    },
  },
  { _id: false }
);

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
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
assignmentSchema.index({ difficulty: 1, createdAt: -1 });
assignmentSchema.index({ title: "text", question: "text" });

module.exports = mongoose.model("Assignment", assignmentSchema);
