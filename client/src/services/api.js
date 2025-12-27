/**
 * API Service
 *
 * All the backend API calls are handled here.
 * Using axios because fetch is annoying to work with for POST requests.
 *
 * Author: Gourav Chaudhary
 */

import axios from "axios";

// Base URL - In production (Vercel), API is at /api, in dev it's proxied
const API_URL = import.meta.env.VITE_API_URL || "https://cipher-sql-studio-server.vercel.app/api";

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============ Assignment APIs ============

// Get all assignments (with optional filters)
export const getAssignments = async (filters = {}) => {
  const response = await api.get("/assignments", { params: filters });
  return response.data;
};

// Get single assignment by ID
export const getAssignment = async (id) => {
  const response = await api.get(`/assignments/${id}`);
  return response.data;
};

// ============ Query Execution ============

// Execute SQL query in sandbox
export const executeQuery = async (assignmentId, query, sessionId) => {
  const response = await api.post("/execute/query", {
    assignmentId,
    query,
    sessionId,
  });
  return response.data;
};

// Cleanup sandbox session (not used much but good to have)
export const cleanupSession = async (sessionId) => {
  const response = await api.post("/execute/cleanup", { sessionId });
  return response.data;
};

// ============ Hints ============

// Get hint from LLM
export const getHint = async (assignmentId, currentQuery, previousHints) => {
  const response = await api.post("/hints", {
    assignmentId,
    currentQuery,
    previousHints,
  });
  return response.data;
};

// ============ Progress Tracking ============
// NOTE: not fully implemented on frontend yet, but API is ready

export const saveProgress = async (
  userId,
  assignmentId,
  sqlQuery,
  isCompleted,
  executionTime,
  wasSuccessful
) => {
  const response = await api.post("/progress", {
    userId,
    assignmentId,
    sqlQuery,
    isCompleted,
    executionTime,
    wasSuccessful,
  });
  return response.data;
};

export const getUserProgress = async (userId) => {
  const response = await api.get(`/progress/${userId}`);
  return response.data;
};

export default api;
