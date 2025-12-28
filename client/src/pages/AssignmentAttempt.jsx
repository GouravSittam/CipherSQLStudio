/**
 * Assignment Attempt Page
 *
 * This is where users actually solve the SQL challenges.
 * Has the SQL editor, sample data viewer, and results panel.
 *
 * Author: Gourav Chaudhary
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAssignment,
  executeQuery,
  getHint,
  getQueryHistory,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

// Components
import SQLEditor from "../components/SQLEditor.jsx";
import SampleDataViewer from "../components/SampleDataViewer.jsx";
import ResultsPanel from "../components/ResultsPanel.jsx";

const AssignmentAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // State management
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [hints, setHints] = useState([]);
  const [loadingHint, setLoadingHint] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch assignment when component mounts or id changes
  useEffect(() => {
    fetchAssignment();
    if (isAuthenticated) {
      fetchQueryHistory();
    }
  }, [id, isAuthenticated]);

  // Load assignment data from API
  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await getAssignment(id);
      setAssignment(response.data);
    } catch (err) {
      console.error("Failed to load assignment:", err);
      // TODO: maybe show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's query history for this assignment
  const fetchQueryHistory = async () => {
    try {
      const response = await getQueryHistory(id);
      if (response.success) {
        setQueryHistory(response.queryHistory || []);
        // Load the last saved query if available
        if (response.savedQuery) {
          setQuery(response.savedQuery);
        }
      }
    } catch (err) {
      console.error("Failed to load query history:", err);
    }
  };

  // Run the SQL query
  const handleExecuteQuery = async () => {
    // Basic validation
    if (!query.trim()) {
      alert("Please write a SQL query first");
      return;
    }

    try {
      setExecuting(true);
      const response = await executeQuery(id, query, sessionId);

      setResults(response);
      setSessionId(response.sessionId); // save for future queries in same sandbox

      // Refresh query history if user is authenticated
      if (isAuthenticated) {
        fetchQueryHistory();
      }
    } catch (err) {
      // Show error in results panel
      setResults({
        success: false,
        error: err.response?.data?.message || "Failed to execute query",
      });
    } finally {
      setExecuting(false);
    }
  };

  // Get hint from LLM
  const handleGetHint = async () => {
    try {
      setLoadingHint(true);
      const response = await getHint(id, query, hints);

      if (response.success) {
        setHints([...hints, response.hint]);
      }
    } catch (err) {
      console.error("Failed to get hint:", err);
      alert("Failed to get hint. Please try again.");
    } finally {
      setLoadingHint(false);
    }
  };

  // Load a previous query from history
  const handleLoadQuery = (historicalQuery) => {
    setQuery(historicalQuery);
    setShowHistory(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="assignment-attempt__loading">
        <div className="spinner"></div>
        <p>Initializing challenge...</p>
      </div>
    );
  }

  // Error state - assignment not found
  if (!assignment) {
    return (
      <div className="assignment-attempt__error">
        <p>Challenge not found</p>
        <button onClick={() => navigate("/")} className="btn btn--primary">
          ← BACK TO CHALLENGES
        </button>
      </div>
    );
  }

  // Authentication gate - require login/signup to solve challenges
  if (!isAuthenticated) {
    return (
      <div className="assignment-attempt">
        <div className="auth-gate">
          <div className="auth-gate__content">
            <div className="auth-gate__icon">🔐</div>
            <h2 className="auth-gate__title">Access Required</h2>
            <p className="auth-gate__message">
              Please sign up or log in to solve SQL challenges and track your progress.
            </p>
            <div className="auth-gate__buttons">
              <button
                onClick={() => navigate("/login")}
                className="btn btn--secondary"
              >
                LOGIN
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="btn btn--primary"
              >
                SIGN UP
              </button>
            </div>
            <button
              onClick={() => navigate("/")}
              className="auth-gate__back"
            >
              ← Back to Challenges
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="assignment-attempt">
      {/* Header with back button and title */}
      <div className="assignment-attempt__header">
        <button onClick={() => navigate("/")} className="btn btn--back">
          ← EXIT
        </button>
        <div className="assignment-attempt__info">
          <h1 className="assignment-attempt__title">{assignment.title}</h1>
          <span
            className={`badge badge--${assignment.difficulty.toLowerCase()}`}
          >
            {assignment.difficulty}
          </span>
        </div>
      </div>

      <div className="assignment-attempt__content">
        {/* Left side - Question & Data */}
        <div className="assignment-attempt__left">
          <section className="question-panel">
            <h2 className="question-panel__title">Objective</h2>
            <p className="question-panel__text">{assignment.question}</p>
          </section>

          <SampleDataViewer tables={assignment.sampleTables} />

          {/* Show hints if any have been unlocked */}
          {hints.length > 0 && (
            <section className="hints-panel">
              <h2 className="hints-panel__title">Power-Ups Unlocked</h2>
              <div className="hints-panel__list">
                {hints.map((hint, idx) => (
                  <div key={idx} className="hint-item">
                    <span className="hint-item__number">HINT {idx + 1}:</span>
                    <p className="hint-item__text">{hint}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right side - Editor & Results */}
        <div className="assignment-attempt__right">
          <section className="editor-panel">
            <div className="editor-panel__header">
              <h2 className="editor-panel__title">SQL TERMINAL</h2>
              <div className="editor-panel__actions">
                {isAuthenticated && queryHistory.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="btn btn--secondary"
                  >
                    📝 HISTORY ({queryHistory.length})
                  </button>
                )}
                <button
                  onClick={handleGetHint}
                  className="btn btn--secondary"
                  disabled={loadingHint}
                >
                  {loadingHint ? "LOADING..." : "💡 POWER-UP"}
                </button>
                <button
                  onClick={handleExecuteQuery}
                  className="btn btn--primary"
                  disabled={executing}
                >
                  {executing ? "RUNNING..." : "▶ EXECUTE"}
                </button>
              </div>
            </div>

            {/* Query History Panel */}
            {showHistory && isAuthenticated && (
              <div className="query-history">
                <h3 className="query-history__title">Your Previous Attempts</h3>
                <div className="query-history__list">
                  {queryHistory
                    .slice()
                    .reverse()
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className={`query-history__item ${item.wasSuccessful
                            ? "query-history__item--success"
                            : "query-history__item--error"
                          }`}
                      >
                        <div className="query-history__item-header">
                          <span className="query-history__item-status">
                            {item.wasSuccessful ? "✓ Success" : "✗ Failed"}
                          </span>
                          <span className="query-history__item-time">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <pre className="query-history__item-query">
                          {item.query}
                        </pre>
                        <div className="query-history__item-footer">
                          {item.executionTime && (
                            <span className="query-history__item-stat">
                              ⚡ {item.executionTime}ms
                            </span>
                          )}
                          {item.rowsAffected !== null && (
                            <span className="query-history__item-stat">
                              📊 {item.rowsAffected} rows
                            </span>
                          )}
                          <button
                            onClick={() => handleLoadQuery(item.query)}
                            className="btn btn--ghost btn--small"
                          >
                            Load
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <SQLEditor value={query} onChange={setQuery} />
          </section>

          <ResultsPanel results={results} />
        </div>
      </div>
    </div>
  );
};

export default AssignmentAttempt;
