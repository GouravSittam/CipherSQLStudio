/**
 * Assignment List Page
 *
 * Shows all available SQL challenges with filtering by difficulty.
 * Click on a card to start a challenge.
 *
 * Author: Gourav Chaudhary
 */

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getAssignments } from "../services/api.ts";
import type { AssignmentSummary, Difficulty } from "../types.ts";

type Filter = "All" | Difficulty;

const FILTERS: Filter[] = ["All", "Easy", "Medium", "Hard"];

// Labels for filter buttons (gaming style)
const FILTER_LABELS: Record<Filter, string> = {
  All: "🎮 ALL LEVELS",
  Easy: "⭐ EASY",
  Medium: "⭐⭐ MEDIUM",
  Hard: "⭐⭐⭐ HARD",
};

export default function AssignmentList() {
  const [assignments, setAssignments] = useState<AssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All");

  const navigate = useNavigate();

  const fetchAssignments = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const response = await getAssignments(filter === "All" ? {} : { difficulty: filter }, signal);
        setAssignments(response.data);
        setError(null);
      } catch (err) {
        if (signal?.aborted) return;
        console.error(err);
        setError("Failed to load assignments. Please try again.");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [filter],
  );

  // Refetch when the filter changes; cancel the previous request if it's still running
  useEffect(() => {
    const controller = new AbortController();
    void fetchAssignments(controller.signal);
    return () => controller.abort();
  }, [fetchAssignments]);

  const openAssignment = (id: string) => navigate(`/assignment/${id}`);

  return (
    <div className="assignment-list">
      <div className="assignment-list__header">
        <h1 className="assignment-list__title">SQL Challenges</h1>
        <p className="assignment-list__subtitle">Level up your SQL skills with real-time feedback</p>
      </div>

      <div className="assignment-list__filters">
        {FILTERS.map((difficulty) => (
          <button
            type="button"
            key={difficulty}
            className={`filter-btn ${filter === difficulty ? "filter-btn--active" : ""}`}
            aria-pressed={filter === difficulty}
            onClick={() => setFilter(difficulty)}
          >
            {FILTER_LABELS[difficulty]}
          </button>
        ))}
      </div>

      {loading && (
        <div className="assignment-list__loading">
          <div className="spinner"></div>
          <p>Initializing challenges...</p>
        </div>
      )}

      {error && (
        <div className="assignment-list__error">
          <p>{error}</p>
          <button type="button" onClick={() => void fetchAssignments()} className="btn btn--primary">
            🔄 RETRY
          </button>
        </div>
      )}

      {!loading && !error && assignments.length === 0 && (
        <div className="assignment-list__empty">
          <p>No challenges found for this difficulty level.</p>
        </div>
      )}

      <div className="assignment-list__grid">
        {assignments.map((assignment) => (
          <div
            key={assignment._id}
            className="assignment-card"
            role="link"
            tabIndex={0}
            onClick={() => openAssignment(assignment._id)}
            onKeyDown={(event) => {
              if (event.key === "Enter") openAssignment(assignment._id);
            }}
          >
            <div className="assignment-card__header">
              <h3 className="assignment-card__title">{assignment.title}</h3>
              <span
                className={`assignment-card__difficulty assignment-card__difficulty--${assignment.difficulty.toLowerCase()}`}
              >
                {assignment.difficulty}
              </span>
            </div>

            <p className="assignment-card__question">{assignment.question}</p>

            {assignment.tags.length > 0 && (
              <div className="assignment-card__tags">
                {assignment.tags.map((tag) => (
                  <span key={tag} className="assignment-card__tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <button type="button" className="assignment-card__btn" tabIndex={-1}>
              START CHALLENGE
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
