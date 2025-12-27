/**
 * Results Panel - displays query output
 *
 * Shows the data table after running a query.
 * Also handles errors and empty states.
 */

import React from "react";

const ResultsPanel = ({ results }) => {
  // No results yet - show placeholder
  if (!results) {
    return (
      <section className="results-panel">
        <h2 className="results-panel__title">Output</h2>
        <div className="results-panel__empty">
          <p>Execute your query to see results</p>
        </div>
      </section>
    );
  }

  // Query failed - show error message
  if (!results.success) {
    return (
      <section className="results-panel">
        <h2 className="results-panel__title">Output</h2>
        <div className="results-panel__error">
          <p className="results-panel__error-title">QUERY FAILED</p>
          <pre className="results-panel__error-message">{results.error}</pre>
        </div>
      </section>
    );
  }

  // Get column names from first row (if we have data)
  const columns =
    results.data && results.data.length > 0 ? Object.keys(results.data[0]) : [];

  return (
    <section className="results-panel">
      <div className="results-panel__header">
        <h2 className="results-panel__title">Output</h2>
        <div className="results-panel__meta">
          {/* Show victory badge when correct */}
          {results.isCorrect && (
            <span className="results-panel__badge results-panel__badge--success">
              VICTORY
            </span>
          )}
          <span className="results-panel__meta-text">
            {results.rowCount} rows • {results.executionTime}ms
          </span>
        </div>
      </div>

      {/* Render the data table if we have rows */}
      {results.data && results.data.length > 0 ? (
        <>
          <div className="results-panel__table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((column, idx) => (
                    <th key={idx} className="data-table__header">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.data.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {columns.map((column, colIdx) => (
                      <td key={colIdx} className="data-table__cell">
                        {row[column] !== null && row[column] !== undefined
                          ? String(row[column])
                          : "NULL"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Warn if results were truncated */}
          {results.truncated && (
            <div className="results-panel__warning">
              Results truncated. Showing first {results.data.length} rows.
            </div>
          )}
        </>
      ) : (
        <div className="results-panel__empty">
          <p>Query executed successfully - 0 rows returned</p>
        </div>
      )}
    </section>
  );
};

export default ResultsPanel;
