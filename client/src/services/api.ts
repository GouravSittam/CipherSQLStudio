/**
 * API Service
 *
 * All backend calls live here, fully typed.
 *
 * Author: Gourav Chaudhary
 */

import axios, { isAxiosError } from "axios";
import type {
  Assignment,
  AssignmentSummary,
  AuthResponse,
  Difficulty,
  HintResponse,
  ListResponse,
  QueryHistoryResponse,
  QueryResult,
  User,
} from "../types.ts";

// VITE_API_URL points at the deployed API. In development, leave it unset to use
// the Vite proxy (/api -> http://localhost:5000/api).
const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "https://cipher-sql-studio-server.vercel.app/api");

export const TOKEN_KEY = "token";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the auth token to every request when we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Pull the server's error message out of a failed request. */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ error?: string; message?: string }>(error)) {
    return error.response?.data?.error ?? error.response?.data?.message ?? fallback;
  }
  return fallback;
}

// ============ Authentication ============

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function signup(
  username: string,
  email: string,
  password: string,
  fullName: string,
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/signup", { username, email, password, fullName });
  return data;
}

export async function getCurrentUser(): Promise<{ success: boolean; user: User }> {
  const { data } = await api.get<{ success: boolean; user: User }>("/auth/me");
  return data;
}

// ============ Assignments ============

export async function getAssignments(
  filters: { difficulty?: Difficulty; search?: string } = {},
  signal?: AbortSignal,
): Promise<ListResponse<AssignmentSummary[]>> {
  const { data } = await api.get<ListResponse<AssignmentSummary[]>>("/assignments", { params: filters, signal });
  return data;
}

export async function getAssignment(id: string, signal?: AbortSignal): Promise<ListResponse<Assignment>> {
  const { data } = await api.get<ListResponse<Assignment>>(`/assignments/${id}`, { signal });
  return data;
}

// ============ Query Execution ============

export async function executeQuery(assignmentId: string, query: string): Promise<QueryResult> {
  const { data } = await api.post<QueryResult>("/execute/query", { assignmentId, query });
  return data;
}

// ============ Hints ============

export async function getHint(
  assignmentId: string,
  currentQuery: string,
  previousHints: string[],
): Promise<HintResponse> {
  const { data } = await api.post<HintResponse>("/hints", { assignmentId, currentQuery, previousHints });
  return data;
}

// ============ Progress ============

export async function getQueryHistory(assignmentId: string, signal?: AbortSignal): Promise<QueryHistoryResponse> {
  const { data } = await api.get<QueryHistoryResponse>("/progress/history", { params: { assignmentId }, signal });
  return data;
}

export async function getUserProgress(userId: string) {
  const { data } = await api.get(`/progress/${userId}`);
  return data;
}

export default api;
