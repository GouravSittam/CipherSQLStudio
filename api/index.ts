/**
 * Vercel serverless entry point.
 *
 * vercel.json rewrites every /api/* request here, and the shared Express app
 * (server/src/app.ts) does the routing - the same code that runs locally.
 *
 * Author: Gourav Chaudhary
 */

import app from "../server/src/app.js";

export default app;
