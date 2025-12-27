/**
 * Assignment List Page
 *
 * Shows all available SQL challenges with filtering by difficulty.
 * Click on a card to start a challenge.
 *
 * Author: Gourav Chaudhary
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAssignments } from "../services/api";

const AssignmentList = () => {
  // State
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");

  const navigate = useNavigate();

  // Refetch when filter changes
  useEffect(() => {
    fetchAssignments();
  }, [filter]);

  // Load assignments from API
  const fetchAssignments = async () => {
    try {
      setLoading(true);

      // Only add filter param if not "All"
      const filters = filter !== "All" ? { difficulty: filter } : {};
      const response = await getAssignments(filters);

      setAssignments(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load assignments. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get difficulty-specific CSS class
  const getDifficultyClass = (difficulty) => {
    return `assignment-card__difficulty--${difficulty.toLowerCase()}`;
  };

  // Labels for filter buttons (gaming style)
  const difficultyLabels = {
    All: "🎮 ALL LEVELS",
    Easy: "⭐ EASY",
    Medium: "⭐⭐ MEDIUM",
    Hard: "⭐⭐⭐ HARD",
  };

  return (
    <div className="assignment-list">
      {/* Page header */}
      <div className="assignment-list__header">
        <h1 className="assignment-list__title">SQL Challenges</h1>
        <p className="assignment-list__subtitle">
          Level up your SQL skills with real-time feedback
        </p>
      </div>

      {/* Filter buttons */}
      <div className="assignment-list__filters">
        {["All", "Easy", "Medium", "Hard"].map((difficulty) => (
          <button
            key={difficulty}
            className={`filter-btn ${
              filter === difficulty ? "filter-btn--active" : ""
            }`}
            onClick={() => setFilter(difficulty)}
          >
            {difficultyLabels[difficulty]}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="assignment-list__loading">
          <div className="spinner"></div>
          <p>Initializing challenges...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="assignment-list__error">
          <p>{error}</p>
          <button onClick={fetchAssignments} className="btn btn--primary">
            🔄 RETRY
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && assignments.length === 0 && (
        <div className="assignment-list__empty">
          <p>No challenges found for this difficulty level.</p>
        </div>
      )}

      {/* Cards grid */}
      <div className="assignment-list__grid">
        {assignments.map((assignment) => (
          <div
            key={assignment._id}
            className="assignment-card"
            onClick={() => navigate(`/assignment/${assignment._id}`)}
          >
            <div className="assignment-card__header">
              <h3 className="assignment-card__title">{assignment.title}</h3>
              <span
                className={`assignment-card__difficulty ${getDifficultyClass(
                  assignment.difficulty
                )}`}
              >
                {assignment.difficulty}
              </span>
            </div>

            <p className="assignment-card__question">{assignment.question}</p>

            {/* Show tags if available */}
            {assignment.tags && assignment.tags.length > 0 && (
              <div className="assignment-card__tags">
                {assignment.tags.map((tag, idx) => (
                  <span key={idx} className="assignment-card__tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <button className="assignment-card__btn">START CHALLENGE</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentList;
