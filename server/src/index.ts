/**
 * Local development / self-hosted entry point.
 *
 *   npm run dev:server   (watch mode)
 *   npm start
 *
 * Author: Gourav Chaudhary
 */

import "./loadEnv.js";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./db/mongo.js";
import { isLLMAvailable } from "./services/hints.js";

try {
  await connectDB();
  console.log("✅ MongoDB connected successfully");
} catch (error) {
  // No point running without the database
  console.error("❌ MongoDB connection error:", error instanceof Error ? error.message : error);
  process.exit(1);
}

console.log(
  isLLMAvailable()
    ? `✅ AI hints enabled (${env.LLM_PROVIDER})`
    : "⚠️  No LLM API key set - AI hints will use built-in fallbacks",
);

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
});
