/**
 * Query Execution Service for Vercel Serverless
 *
 * Handles PostgreSQL sandbox operations for running user queries.
 *
 * Author: Gourav Chaudhary
 */

const getPool = require("./postgres");
const { v4: uuidv4 } = require("uuid");

const MAX_EXECUTION_TIME =
  parseInt(process.env.MAX_QUERY_EXECUTION_TIME) || 5000;
const MAX_RESULT_ROWS = parseInt(process.env.MAX_RESULT_ROWS) || 1000;

function validateQuery(query) {
  const trimmedQuery = query.trim().toUpperCase();

  const dangerousKeywords = [
    "DROP",
    "DELETE",
    "TRUNCATE",
    "ALTER",
    "CREATE",
    "INSERT",
    "UPDATE",
    "GRANT",
    "REVOKE",
    "EXECUTE",
  ];

  for (const keyword of dangerousKeywords) {
    if (trimmedQuery.includes(keyword)) {
      throw new Error(`Operation not allowed: ${keyword}`);
    }
  }

  if (!trimmedQuery.startsWith("SELECT")) {
    throw new Error("Only SELECT queries are allowed");
  }

  return true;
}

async function createSandboxSchema(sessionId) {
  const schemaName = `workspace_${sessionId.replace(/-/g, "_")}`;
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    return schemaName;
  } finally {
    client.release();
  }
}

async function loadSampleData(schemaName, sampleTables) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`SET search_path TO ${schemaName}`);

    for (const table of sampleTables) {
      await client.query(`DROP TABLE IF EXISTS ${table.tableName} CASCADE`);

      const columns = table.columns
        .map((col) => `${col.columnName} ${col.dataType}`)
        .join(", ");

      await client.query(`CREATE TABLE ${table.tableName} (${columns})`);

      if (table.rows && table.rows.length > 0) {
        const columnNames = table.columns
          .map((col) => col.columnName)
          .join(", ");

        for (const row of table.rows) {
          const placeholders = row.map((_, idx) => `$${idx + 1}`).join(", ");
          await client.query(
            `INSERT INTO ${table.tableName} (${columnNames}) VALUES (${placeholders})`,
            row
          );
        }
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function executeQuery(schemaName, query) {
  validateQuery(query);

  const pool = getPool();
  const client = await pool.connect();
  const startTime = Date.now();

  try {
    await client.query(`SET search_path TO ${schemaName}`);
    await client.query(`SET statement_timeout = ${MAX_EXECUTION_TIME}`);

    const result = await client.query(query);
    const executionTime = Date.now() - startTime;

    return {
      success: true,
      rows: result.rows.slice(0, MAX_RESULT_ROWS),
      rowCount: result.rowCount,
      executionTime,
      truncated: result.rowCount > MAX_RESULT_ROWS,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      executionTime: Date.now() - startTime,
    };
  } finally {
    client.release();
  }
}

async function cleanupSchema(schemaName) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
  } finally {
    client.release();
  }
}

module.exports = {
  validateQuery,
  createSandboxSchema,
  loadSampleData,
  executeQuery,
  cleanupSchema,
};
