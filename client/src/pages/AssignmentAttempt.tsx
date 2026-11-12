/**
 * Assignment Attempt Page
 *
 * This is where users actually solve the SQL challenges.
 * Has the SQL editor, sample data viewer, and results panel.
 *
 * Author: Gourav Chaudhary
 */

import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import ResultsPanel from "../components/ResultsPanel.tsx";
import SampleDataViewer from "../components/SampleDataViewer.tsx";
import SQLEditor from "../components/SQLEditor.tsx";
import { useAuth } from "../context/AuthContext.tsx";
import { executeQuery, getAssignment, getErrorMessage, getHint, getQueryHistory } from "../services/api.ts";
import type { Assignment, QueryAttempt, QueryResult } from "../types.ts";

export default function AssignmentAttempt() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QueryResult | null>(null);
  const [executing, setExecuting] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [loadingHint, setLoadingHint] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryAttempt[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load the assignment whenever the id changes
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setResults(null);
    setHints([]);

    getAssignment(id, controller.signal)
      .then((response) => setAssignment(response.data))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load assignment:", err);
        setAssignment(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  const fetchQueryHistory = useCallback(
    async (signal?: AbortSignal, restoreSavedQuery = false) => {
      try {
        const response = await getQueryHistory(id, signal);
        if (!response.success) return;
        setQueryHistory(response.queryHistory);
        // Pick up where the user left off
        if (restoreSavedQuery && response.savedQuery) setQuery(response.savedQuery);
      } catch (err) {
        if (!signal?.aborted) console.error("Failed to load query history:", err);
      }
    },
    [id],
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();
    void fetchQueryHistory(controller.signal, true);
    return () => controller.abort();
  }, [isAuthenticated, fetchQueryHistory]);

  const handleExecuteQuery = useCallback(async () => {
    if (!query.trim()) {
      alert("Please write a SQL query first");
      return;
    }

    setExecuting(true);
    try {
      setResults(await executeQuery(id, query));
      if (isAuthenticated) void fetchQueryHistory();
    } catch (err) {
      setResults({ success: false, error: getErrorMessage(err, "Failed to execute query") });
    } finally {
      setExecuting(false);
    }
  }, [id, query, isAuthenticated, fetchQueryHistory]);

  const handleGetHint = async () => {
    setLoadingHint(true);
    try {
      const response = await getHint(id, query, hints);
      if (response.success) setHints((previous) => [...previous, response.hint]);
    } catch (err) {
      console.error("Failed to get hint:", err);
      alert("Failed to get hint. Please try again.");
    } finally {
      setLoadingHint(false);
    }
  };

  const handleLoadQuery = (historicalQuery: string) => {
    setQuery(historicalQuery);
    setShowHistory(false);
  };

  if (loading) {
    return (
      <div className="assignment-attempt__loading">
        <div className="spinner"></div>
        <p>Initializing challenge...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="assignment-attempt__error">
        <p>Challenge not found</p>
        <button type="button" onClick={() => navigate("/")} className="btn btn--primary">
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
              <button type="button" onClick={() => navigate("/login")} className="btn btn--secondary">
                LOGIN
              </button>
              <button type="button" onClick={() => navigate("/signup")} className="btn btn--primary">
                SIGN UP
              </button>
            </div>
            <button type="button" onClick={() => navigate("/")} className="auth-gate__back">
              ← Back to Challenges
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assignment-attempt">
      <title>{`${assignment.title} | CipherSQLStudio`}</title>

      <div className="assignment-attempt__header">
        <button type="button" onClick={() => navigate("/")} className="btn btn--back">
          ← EXIT
        </button>
        <div className="assignment-attempt__info">
          <h1 className="assignment-attempt__title">{assignment.title}</h1>
          <span className={`badge badge--${assignment.difficulty.toLowerCase()}`}>{assignment.difficulty}</span>
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
                {queryHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowHistory((open) => !open)}
                    className="btn btn--secondary"
                  >
                    📝 HISTORY ({queryHistory.length})
                  </button>
                )}
                <button type="button" onClick={handleGetHint} className="btn btn--secondary" disabled={loadingHint}>
                  {loadingHint ? "LOADING..." : "💡 POWER-UP"}
                </button>
                <button
                  type="button"
                  onClick={handleExecuteQuery}
                  className="btn btn--primary"
                  disabled={executing}
                  title="Ctrl/Cmd + Enter"
                >
                  {executing ? "RUNNING..." : "▶ EXECUTE"}
                </button>
              </div>
            </div>

            {showHistory && (
              <div className="query-history">
                <h3 className="query-history__title">Your Previous Attempts</h3>
                <div className="query-history__list">
                  {queryHistory.toReversed().map((item, idx) => (
                    <div
                      key={item._id ?? idx}
                      className={`query-history__item ${
                        item.wasSuccessful ? "query-history__item--success" : "query-history__item--error"
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
                      <pre className="query-history__item-query">{item.query}</pre>
                      <div className="query-history__item-footer">
                        {item.executionTime != null && (
                          <span className="query-history__item-stat">⚡ {item.executionTime}ms</span>
                        )}
                        {item.rowsAffected != null && (
                          <span className="query-history__item-stat">📊 {item.rowsAffected} rows</span>
                        )}
                        <button
                          type="button"
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

            <SQLEditor value={query} onChange={setQuery} onRun={handleExecuteQuery} />
          </section>

          <ResultsPanel results={results} />
        </div>
      </div>
    </div>
  );
}
