/**
 * Sample Data Viewer
 *
 * Displays the available tables and their data for a challenge.
 * Users can see what data they're working with before writing queries.
 */

import type { SampleTable } from "../types.ts";

/** Render a database value as text, showing NULL for missing values. */
export function formatCell(value: unknown): string {
  return value === null || value === undefined ? "NULL" : String(value);
}

export default function SampleDataViewer({ tables }: { tables: SampleTable[] }) {
  if (tables.length === 0) return null;

  return (
    <section className="sample-data">
      <h2 className="sample-data__title">Available Tables</h2>

      {tables.map((table) => (
        <div key={table.tableName} className="sample-data__table">
          <h3 className="sample-data__table-name">{table.tableName}</h3>

          <div className="sample-data__table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {table.columns.map((col) => (
                    <th key={col.columnName} className="data-table__header">
                      {col.columnName}
                      <span className="data-table__type">{col.dataType}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.length > 0 ? (
                  table.rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="data-table__cell">
                          {formatCell(cell)}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={table.columns.length} className="data-table__empty">
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
}
