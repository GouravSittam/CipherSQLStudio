const pool = require("../config/postgres");
const { v4: uuidv4 } = require("uuid");

class QueryExecutionService {
  constructor() {
    this.maxExecutionTime =
      parseInt(process.env.MAX_QUERY_EXECUTION_TIME) || 5000;
    this.maxResultRows = parseInt(process.env.MAX_RESULT_ROWS) || 1000;
  }

  /**
   * Validates SQL query for security
   */
  validateQuery(query) {
    const trimmedQuery = query.trim().toUpperCase();

    // Block destructive operations
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

    // Must be a SELECT query
    if (!trimmedQuery.startsWith("SELECT")) {
      throw new Error("Only SELECT queries are allowed");
    }

    return true;
  }

  /**
   * Creates isolated schema for user session
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
   * Loads sample tables into user's schema
   */
  async loadSampleData(schemaName, sampleTables) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(`SET search_path TO ${schemaName}`);

      for (const table of sampleTables) {
        // Drop table if exists
        await client.query(`DROP TABLE IF EXISTS ${table.tableName} CASCADE`);

        // Create table
        const columns = table.columns
          .map((col) => `${col.columnName} ${col.dataType}`)
          .join(", ");

        await client.query(`CREATE TABLE ${table.tableName} (${columns})`);

        // Insert rows
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
   * Executes user's SQL query in sandbox
   */
  async executeQuery(schemaName, query) {
    this.validateQuery(query);

    const client = await pool.connect();
    const startTime = Date.now();

    try {
      await client.query(`SET search_path TO ${schemaName}`);
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
   * Cleans up sandbox schema
   */
  async cleanupSchema(schemaName) {
    const client = await pool.connect();

    try {
      await client.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
    } catch (error) {
      console.error("Error cleaning up schema:", error);
    } finally {
      client.release();
    }
  }

  /**
   * Gets schema information for display
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
