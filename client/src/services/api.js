import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Assignment APIs
export const getAssignments = async (filters = {}) => {
  const response = await api.get("/assignments", { params: filters });
  return response.data;
};

export const getAssignment = async (id) => {
  const response = await api.get(`/assignments/${id}`);
  return response.data;
};

// Query Execution APIs
export const executeQuery = async (assignmentId, query, sessionId) => {
  const response = await api.post("/execute/query", {
    assignmentId,
    query,
    sessionId,
  });
  return response.data;
};

export const cleanupSession = async (sessionId) => {
  const response = await api.post("/execute/cleanup", { sessionId });
  return response.data;
};

// Hint APIs
export const getHint = async (assignmentId, currentQuery, previousHints) => {
  const response = await api.post("/hints", {
    assignmentId,
    currentQuery,
    previousHints,
  });
  return response.data;
};

// Progress APIs
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
