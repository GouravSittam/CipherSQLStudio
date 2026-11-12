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

import { Schema, model } from "mongoose";

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

// These map to PostgreSQL types
export const COLUMN_TYPES = ["INTEGER", "TEXT", "REAL", "BOOLEAN", "DATE", "TIMESTAMP", "VARCHAR"] as const;
export type ColumnType = (typeof COLUMN_TYPES)[number];

export const EXPECTED_OUTPUT_TYPES = ["table", "single_value", "column", "count", "row"] as const;
export type ExpectedOutputType = (typeof EXPECTED_OUTPUT_TYPES)[number];

export interface Column {
  columnName: string;
  dataType: ColumnType;
}

export interface SampleTable {
  tableName: string;
  columns: Column[];
  rows: unknown[][];
}

export interface ExpectedOutput {
  type: ExpectedOutputType;
  value?: unknown;
}

export interface Assignment {
  title: string;
  difficulty: Difficulty;
  question: string;
  sampleTables: SampleTable[];
  expectedOutput: ExpectedOutput;
  hints: string[];
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const columnSchema = new Schema<Column>(
  {
    columnName: { type: String, required: true },
    dataType: { type: String, required: true, enum: COLUMN_TYPES },
  },
  { _id: false },
);

const sampleTableSchema = new Schema<SampleTable>(
  {
    tableName: { type: String, required: true },
    columns: { type: [columnSchema], default: [] },
    // 2D array - each row is an array of values
    rows: { type: [[Schema.Types.Mixed]], default: [] },
  },
  { _id: false },
);

const assignmentSchema = new Schema<Assignment>(
  {
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, required: true, enum: DIFFICULTIES },
    question: { type: String, required: true },
    sampleTables: { type: [sampleTableSchema], default: [] },
    expectedOutput: {
      type: { type: String, enum: EXPECTED_OUTPUT_TYPES, required: true },
      value: Schema.Types.Mixed,
    },
    // Pre-defined hints (optional, we mostly use the LLM now)
    hints: { type: [String], default: [] },
    // For filtering (e.g. "JOIN", "GROUP BY", "subquery")
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

assignmentSchema.index({ difficulty: 1, createdAt: -1 });
assignmentSchema.index({ title: "text", question: "text" });

export const AssignmentModel = model<Assignment>("Assignment", assignmentSchema);
