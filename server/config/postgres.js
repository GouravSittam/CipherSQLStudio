/**
 * PostgreSQL Connection Pool
 *
 * This is the sandbox database where user queries run.
 * Each user gets an isolated schema so they can't mess with each other's data.
 *
 * Using connection pooling for better performance.
 */

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  // Supabase requires SSL - check if we're using it
  ssl: process.env.POSTGRES_HOST?.includes("supabase")
    ? { rejectUnauthorized: false }
    : false,
});

// Log when we connect
pool.on("connect", () => {
  console.log("✅ PostgreSQL connected successfully");
});

// Handle unexpected errors
pool.on("error", (err) => {
  console.error("❌ Unexpected PostgreSQL error:", err);
});

module.exports = pool;
