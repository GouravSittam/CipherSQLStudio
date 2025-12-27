/**
 * Sample Data Viewer
 *
 * Displays the available tables and their data for a challenge.
 * Users can see what data they're working with before writing queries.
 */

import React from "react";

const SampleDataViewer = ({ tables }) => {
  // Don't render anything if no tables
  if (!tables || tables.length === 0) {
    return null;
  }

  return (
    <section className="sample-data">
      <h2 className="sample-data__title">Available Tables</h2>

      {tables.map((table, tableIdx) => (
        <div key={tableIdx} className="sample-data__table">
          <h3 className="sample-data__table-name">{table.tableName}</h3>

          <div className="sample-data__table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {table.columns.map((col, colIdx) => (
                    <th key={colIdx} className="data-table__header">
                      {col.columnName}
                      <span className="data-table__type">{col.dataType}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Render rows if we have them */}
                {table.rows && table.rows.length > 0 ? (
                  table.rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="data-table__cell">
                          {cell !== null && cell !== undefined
                            ? String(cell)
                            : "NULL"}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={table.columns.length}
                      className="data-table__empty"
                    >
                      No sample data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
};

export default SampleDataViewer;
