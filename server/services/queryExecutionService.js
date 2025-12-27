/**
 * Query Execution Service
 *
 * Handles all the PostgreSQL sandbox stuff:
 * - Creating isolated schemas per user
 * - Loading sample data into tables
 * - Running user queries safely
 * - Cleaning up when done
 *
 * Security is super important here - we don't want users
 * running DROP statements or anything crazy.
 *
 * Author: Gourav Chaudhary
 */

const pool = require("../config/postgres");
const { v4: uuidv4 } = require("uuid");

class QueryExecutionService {
  constructor() {
    // Config values - can override via env vars
    this.maxExecutionTime =
      parseInt(process.env.MAX_QUERY_EXECUTION_TIME) || 5000; // 5 seconds
    this.maxResultRows = parseInt(process.env.MAX_RESULT_ROWS) || 1000;
  }

  /**
   * Security check - block dangerous operations
   * Only SELECT queries are allowed
   */
  validateQuery(query) {
    const trimmedQuery = query.trim().toUpperCase();

    // Nope, not allowing any of these
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

    // Must start with SELECT
    if (!trimmedQuery.startsWith("SELECT")) {
      throw new Error("Only SELECT queries are allowed");
    }

    return true;
  }

  /**
   * Create a fresh schema for this user's session
   * Schema name is based on session ID
   */
  async createSandboxSchema(sessionId) {
    const schemaName = `workspace_${sessionId.replace(/-/g, "_")}`;
    const client = await pool.connect();

    try {
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
      return schemaName;
    } finally {
      client.release();
    }
  }

  /**
   * Populate the sandbox with sample tables and data
   * Called before user runs their query
   */
  async loadSampleData(schemaName, sampleTables) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(`SET search_path TO ${schemaName}`);

      for (const table of sampleTables) {
        // Start fresh each time
        await client.query(`DROP TABLE IF EXISTS ${table.tableName} CASCADE`);

        // Build column definitions
        const columns = table.columns
          .map((col) => `${col.columnName} ${col.dataType}`)
          .join(", ");

        await client.query(`CREATE TABLE ${table.tableName} (${columns})`);

        // Insert sample rows if we have any
        if (table.rows && table.rows.length > 0) {
          const columnNames = table.columns
            .map((col) => col.columnName)
            .join(", ");

          for (const row of table.rows) {
            const placeholders = row.map((_, idx) => `$${idx + 1}`).join(", ");
            const insertQuery = `INSERT INTO ${table.tableName} (${columnNames}) VALUES (${placeholders})`;
            await client.query(insertQuery, row);
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

  /**
   * Run the actual user query
   * Has timeout protection and result limiting
   */
  async executeQuery(schemaName, query) {
    // Security check first
    this.validateQuery(query);

    const client = await pool.connect();
    const startTime = Date.now();

    try {
      // Use the sandbox schema
      await client.query(`SET search_path TO ${schemaName}`);

      // Don't let queries run forever
      await client.query(`SET statement_timeout = ${this.maxExecutionTime}`);

      const result = await client.query(query);
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        rows: result.rows.slice(0, this.maxResultRows),
        rowCount: result.rowCount,
        executionTime,
        truncated: result.rowCount > this.maxResultRows,
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

  /**
   * Delete the sandbox schema
   * Cleans up all tables created for this session
   */
  async cleanupSchema(schemaName) {
    const client = await pool.connect();

    try {
      await client.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
    } catch (error) {
      // Not critical if this fails, just log it
      console.error("Error cleaning up schema:", error);
    } finally {
      client.release();
    }
  }

  /**
   * Get info about tables in a schema
   * Useful for debugging, not used in UI currently
   */
  async getSchemaInfo(schemaName) {
    const client = await pool.connect();

    try {
      await client.query(`SET search_path TO ${schemaName}`);

      const result = await client.query(
        `
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_schema = $1
        ORDER BY table_name, ordinal_position
      `,
        [schemaName]
      );

      // Group by table
      const tables = {};
      for (const row of result.rows) {
        if (!tables[row.table_name]) {
          tables[row.table_name] = [];
        }
        tables[row.table_name].push({
          name: row.column_name,
          type: row.data_type,
        });
      }

      return tables;
    } finally {
      client.release();
    }
  }
}

module.exports = new QueryExecutionService();
