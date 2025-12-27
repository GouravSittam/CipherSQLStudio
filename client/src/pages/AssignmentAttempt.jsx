import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAssignment, executeQuery, getHint } from "../services/api";
import SQLEditor from "../components/SQLEditor.jsx";
import SampleDataViewer from "../components/SampleDataViewer.jsx";
import ResultsPanel from "../components/ResultsPanel.jsx";

const AssignmentAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [hints, setHints] = useState([]);
  const [loadingHint, setLoadingHint] = useState(false);

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await getAssignment(id);
      setAssignment(response.data);
    } catch (err) {
      console.error("Failed to load assignment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteQuery = async () => {
    if (!query.trim()) {
      alert("Please write a SQL query first");
      return;
    }

    try {
      setExecuting(true);
      const response = await executeQuery(id, query, sessionId);

      setResults(response);
      setSessionId(response.sessionId);

    } catch (err) {
      setResults({
        success: false,
        error: err.response?.data?.message || "Failed to execute query",
      });
    } finally {
      setExecuting(false);
    }
  };

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
        <button onClick={() => navigate("/")} className="btn btn--primary">
          ← BACK TO CHALLENGES
        </button>
      </div>
    );
  }

  return (
    <div className="assignment-attempt">
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
                {hints.map((hint, index) => (
                  <div key={index} className="hint-item">
                    <span className="hint-item__number">HINT {index + 1}:</span>
                    <p className="hint-item__text">{hint}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="assignment-attempt__right">
          <section className="editor-panel">
            <div className="editor-panel__header">
              <h2 className="editor-panel__title">SQL TERMINAL</h2>
              <div className="editor-panel__actions">
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
            <SQLEditor value={query} onChange={setQuery} />
          </section>

          <ResultsPanel results={results} />
        </div>
      </div>
    </div>
  );
};

export default AssignmentAttempt;
