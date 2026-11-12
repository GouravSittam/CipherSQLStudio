/**
 * Shared types for API data used across the client.
 *
 * Author: Gourav Chaudhary
 */

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: "student" | "admin";
}

export interface Column {
  columnName: string;
  dataType: string;
}

export interface SampleTable {
  tableName: string;
  columns: Column[];
  rows: unknown[][];
}

export interface AssignmentSummary {
  _id: string;
  title: string;
  difficulty: Difficulty;
  question: string;
  tags: string[];
  createdAt: string;
}

export interface Assignment extends AssignmentSummary {
  sampleTables: SampleTable[];
}

export type Row = Record<string, unknown>;

export type QueryResult =
  | {
      success: true;
      data: Row[];
      rowCount: number;
      executionTime: number;
      truncated: boolean;
      isCorrect: boolean;
    }
  | { success: false; error: string; executionTime?: number; isCorrect?: false };

export interface QueryAttempt {
  _id?: string;
  query: string;
  timestamp: string;
  wasSuccessful: boolean;
  executionTime?: number;
  rowsAffected?: number;
  errorMessage?: string;
}

export interface QueryHistoryResponse {
  success: boolean;
  queryHistory: QueryAttempt[];
  attempts: number;
  isCompleted: boolean;
  lastAttempt?: string;
  savedQuery: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface HintResponse {
  success: boolean;
  hint: string;
  usingFallback: boolean;
}

export interface ListResponse<T> {
  success: boolean;
  count?: number;
  data: T;
}
