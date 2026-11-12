/**
 * Answer checking (auto-grading).
 *
 * Compares a query's result rows with an assignment's expected output.
 * Values are compared loosely so that PostgreSQL's driver quirks don't make a
 * correct answer look wrong (e.g. NUMERIC and COUNT(*) come back as strings,
 * DATE comes back as a JS Date).
 *
 * Author: Gourav Chaudhary
 */

import type { ExpectedOutput } from "../models/Assignment.js";
import type { Row } from "./sandbox.js";

function isNumeric(value: unknown): boolean {
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "bigint") return true;
  return typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value));
}

export function valuesEqual(actual: unknown, expected: unknown): boolean {
  if (actual == null || expected == null) return actual == null && expected == null;

  if (actual instanceof Date) {
    const iso = actual.toISOString();
    return iso === String(expected) || iso.slice(0, 10) === String(expected);
  }

  if (isNumeric(actual) && isNumeric(expected)) {
    return Math.abs(Number(actual) - Number(expected)) < 1e-6;
  }

  return String(actual) === String(expected);
}

function rowsEqual(actual: Row | undefined, expected: unknown): boolean {
  if (!actual || typeof expected !== "object" || expected === null) return false;
  const expectedRow = expected as Row;
  const keys = Object.keys(expectedRow);
  return (
    keys.length === Object.keys(actual).length &&
    keys.every((key) => valuesEqual(actual[key], expectedRow[key]))
  );
}

function firstValue(row: Row | undefined): unknown {
  return row ? Object.values(row)[0] : undefined;
}

export function isCorrectAnswer(rows: Row[], expected: ExpectedOutput | null | undefined): boolean {
  if (!expected?.type) return false;
  const { type, value } = expected;

  switch (type) {
    case "count":
      return rows.length === Number(value);

    case "single_value":
      return rows.length === 1 && valuesEqual(firstValue(rows[0]), value);

    case "row":
      return rows.length === 1 && rowsEqual(rows[0], value);

    case "column": {
      if (!Array.isArray(value) || value.length !== rows.length) return false;
      return rows.every((row, i) => valuesEqual(firstValue(row), value[i]));
    }

    case "table": {
      if (!Array.isArray(value) || value.length !== rows.length) return false;
      return rows.every((row, i) => rowsEqual(row, value[i]));
    }

    default:
      return false;
  }
}
