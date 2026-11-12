/**
 * PostgreSQL connection pool (the sandbox where user queries run).
 *
 * Accepts either POSTGRES_URL or the individual POSTGRES_* variables.
 * SSL is on by default (Supabase/Neon need it) and off for localhost.
 *
 * Author: Gourav Chaudhary
 */

import pg from "pg";
import { env } from "../config/env.js";

let pool: pg.Pool | undefined;

function sslEnabled(): boolean {
  if (env.POSTGRES_SSL) return env.POSTGRES_SSL === "true";
  // POSTGRES_URL wins when set, so judge SSL by whichever one is actually used
  const host = env.POSTGRES_URL ?? env.POSTGRES_HOST ?? "";
  return !/localhost|127\.0\.0\.1/.test(host);
}

export function getPool(): pg.Pool {
  if (pool) return pool;

  pool = new pg.Pool({
    ...(env.POSTGRES_URL
      ? { connectionString: env.POSTGRES_URL }
      : {
          host: env.POSTGRES_HOST,
          port: env.POSTGRES_PORT,
          database: env.POSTGRES_DB,
          user: env.POSTGRES_USER,
          password: env.POSTGRES_PASSWORD,
        }),
    ssl: sslEnabled() ? { rejectUnauthorized: false } : false,
    // Serverless functions should hold as few connections as possible
    max: env.isServerless ? 1 : 10,
  });

  pool.on("error", (error) => {
    console.error("❌ Unexpected PostgreSQL error:", error);
  });

  return pool;
}
