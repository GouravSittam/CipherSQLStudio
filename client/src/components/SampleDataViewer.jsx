import React from "react";

const SampleDataViewer = ({ tables }) => {
  if (!tables || tables.length === 0) {
    return null;
  }

  return (
    <section className="sample-data">
      <h2 className="sample-data__title">Available Tables</h2>

      {tables.map((table, tableIndex) => (
        <div key={tableIndex} className="sample-data__table">
          <h3 className="sample-data__table-name">{table.tableName}</h3>

          <div className="sample-data__table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {table.columns.map((column, colIndex) => (
                    <th key={colIndex} className="data-table__header">
                      {column.columnName}
                      <span className="data-table__type">
                        {column.dataType}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows && table.rows.length > 0 ? (
                  table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="data-table__cell">
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
