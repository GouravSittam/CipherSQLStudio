/**
 * PostgreSQL Connection Pool for Vercel Serverless
 *
 * Shared PostgreSQL connection with caching for serverless.
 * Each user gets an isolated schema for query execution.
 *
 * Author: Gourav Chaudhary
 */

const { Pool } = require("pg");

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: process.env.POSTGRES_HOST?.includes("supabase")
        ? { rejectUnauthorized: false }
        : { rejectUnauthorized: false },
      max: 1, // Limit connections for serverless
    });
  }
  return pool;
}

module.exports = getPool;
