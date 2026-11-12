/**
 * Query Sandbox Service
 *
 * Runs a user's SQL against an assignment's sample tables in PostgreSQL.
 *
 * Every run happens inside a single transaction that is always rolled back:
 *   BEGIN → CREATE SCHEMA → load sample tables → run user query → ROLLBACK
 * so nothing a query does can ever persist, schemas never pile up, and
 * concurrent users can't see each other's data.
 *
 * Author: Gourav Chaudhary
 */

import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { getPool } from "../db/postgres.js";
import { COLUMN_TYPES, type SampleTable } from "../models/Assignment.js";

export type Row = Record<string, unknown>;

export type QueryResult =
  | { success: true; rows: Row[]; rowCount: number; executionTime: number; truncated: boolean }
  | { success: false; error: string; executionTime: number };

const FORBIDDEN_KEYWORDS = [
  "DROP",
  "DELETE",
  "TRUNCATE",
  "ALTER",
  "CREATE",
  "INSERT",
  "UPDATE",
  "MERGE",
  "GRANT",
  "REVOKE",
  "EXECUTE",
  "COPY",
] as const;

const FORBIDDEN_PATTERN = new RegExp(`\\b(${FORBIDDEN_KEYWORDS.join("|")})\\b`, "i");
const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Remove comments and string literals so keyword checks only look at real SQL. */
function stripCommentsAndStrings(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, " ")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/'(?:[^']|'')*'/g, "''");
}

/**
 * Security check: only a single read-only SELECT (or WITH … SELECT) statement.
 * Returns an error message, or null when the query is allowed.
 */
export function checkQuery(query: string): string | null {
  const sql = stripCommentsAndStrings(query).trim().replace(/;\s*$/, "");

  if (!sql) return "Query is empty";
  if (sql.includes(";")) return "Only one statement can be run at a time";

  const forbidden = sql.match(FORBIDDEN_PATTERN);
  if (forbidden?.[1]) return `Operation not allowed: ${forbidden[1].toUpperCase()}`;

  if (!/^(SELECT|WITH)\b/i.test(sql)) return "Only SELECT queries are allowed";

  return null;
}

function assertIdentifier(name: string): string {
  if (!IDENTIFIER.test(name)) throw new Error(`Invalid identifier in sample data: ${name}`);
  return name;
}

function assertColumnType(type: string): string {
  if (!(COLUMN_TYPES as readonly string[]).includes(type)) {
    throw new Error(`Invalid column type in sample data: ${type}`);
  }
  return type;
}

export async function runInSandbox(sampleTables: SampleTable[], query: string): Promise<QueryResult> {
  const rejection = checkQuery(query);
  if (rejection) return { success: false, error: rejection, executionTime: 0 };

  const schema = `sandbox_${randomUUID().replaceAll("-", "_")}`;
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    await client.query(`CREATE SCHEMA ${schema}`);
    await client.query(`SET LOCAL search_path TO ${schema}`);

    for (const table of sampleTables) {
      const tableName = assertIdentifier(table.tableName);
      const columns = table.columns.map((col) => ({
        name: assertIdentifier(col.columnName),
        type: assertColumnType(col.dataType),
      }));

      await client.query(
        `CREATE TABLE ${tableName} (${columns.map((c) => `${c.name} ${c.type}`).join(", ")})`,
      );

      if (table.rows.length > 0) {
        // One multi-row INSERT per table instead of one round trip per row
        const values: unknown[] = [];
        const tuples = table.rows.map((row) => {
          const placeholders = row.map((cell) => {
            values.push(cell);
            return `$${values.length}`;
          });
          return `(${placeholders.join(", ")})`;
        });

        await client.query(
          `INSERT INTO ${tableName} (${columns.map((c) => c.name).join(", ")}) VALUES ${tuples.join(", ")}`,
          values,
        );
      }
    }

    await client.query(`SET LOCAL statement_timeout = ${env.MAX_QUERY_EXECUTION_TIME}`);

    const startedAt = performance.now();
    try {
      const result = await client.query<Row>(query);
      const rowCount = result.rowCount ?? result.rows.length;
      return {
        success: true,
        rows: result.rows.slice(0, env.MAX_RESULT_ROWS),
        rowCount,
        executionTime: Math.round(performance.now() - startedAt),
        truncated: rowCount > env.MAX_RESULT_ROWS,
      };
    } catch (error) {
      // The user's query failed (syntax error, timeout, ...) - report it, don't crash
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Math.round(performance.now() - startedAt),
      };
    }
  } finally {
    await client.query("ROLLBACK").catch(() => undefined);
    client.release();
  }
}
