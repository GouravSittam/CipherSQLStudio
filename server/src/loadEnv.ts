/**
 * Loads environment variables from a local .env file during development.
 *
 * Uses Node's built-in `process.loadEnvFile` (no dotenv needed). Vercel injects
 * env vars itself, so this module is only imported by local entry points.
 * Existing variables are never overwritten, so the root .env wins over server/.env.
 *
 * Author: Gourav Chaudhary
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";

for (const file of [".env", "server/.env"]) {
  const path = resolve(process.cwd(), file);
  if (existsSync(path)) {
    process.loadEnvFile(path);
  }
}
