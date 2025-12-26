import React from "react";

const ResultsPanel = ({ results }) => {
  if (!results) {
    return (
      <section className="results-panel">
        <h2 className="results-panel__title">Results</h2>
        <div className="results-panel__empty">
          <p>Execute a query to see results</p>
        </div>
      </section>
    );
  }

  if (!results.success) {
    return (
      <section className="results-panel">
        <h2 className="results-panel__title">Results</h2>
        <div className="results-panel__error">
          <p className="results-panel__error-title">❌ Query Error</p>
          <pre className="results-panel__error-message">{results.error}</pre>
        </div>
      </section>
    );
  }

  const columns =
    results.data && results.data.length > 0 ? Object.keys(results.data[0]) : [];

  return (
    <section className="results-panel">
      <div className="results-panel__header">
        <h2 className="results-panel__title">Results</h2>
        <div className="results-panel__meta">
          {results.isCorrect && (
            <span className="results-panel__badge results-panel__badge--success">
              ✓ Correct
            </span>
          )}
          <span className="results-panel__meta-text">
            {results.rowCount} rows • {results.executionTime}ms
          </span>
        </div>
      </div>

      {results.data && results.data.length > 0 ? (
        <>
          <div className="results-panel__table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th key={index} className="data-table__header">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="data-table__cell">
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

          {results.truncated && (
            <div className="results-panel__warning">
              ⚠️ Results truncated. Showing first {results.data.length} rows.
            </div>
          )}
        </>
      ) : (
        <div className="results-panel__empty">
          <p>Query executed successfully but returned no rows</p>
        </div>
      )}
    </section>
  );
};

export default ResultsPanel;
