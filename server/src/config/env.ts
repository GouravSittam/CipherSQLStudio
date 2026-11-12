/**
 * Validated environment configuration.
 *
 * Every setting the backend reads goes through this zod schema, so a missing or
 * malformed variable fails loudly at startup instead of deep inside a request.
 *
 * Author: Gourav Chaudhary
 */

import { z } from "zod";

/** Treat empty strings (e.g. `OPENAI_API_KEY=`) as "not set". */
const optionalString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  CORS_ORIGIN: optionalString,

  MONGODB_URI: z.string({ error: "MONGODB_URI is required" }).min(1, "MONGODB_URI is required"),

  // Either a full connection string or the individual parts
  POSTGRES_URL: optionalString,
  POSTGRES_HOST: optionalString,
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DB: optionalString,
  POSTGRES_USER: optionalString,
  POSTGRES_PASSWORD: optionalString,
  POSTGRES_SSL: z.enum(["true", "false"]).optional(),

  JWT_SECRET: optionalString,
  JWT_EXPIRES_IN: z.string().default("7d"),

  LLM_PROVIDER: z.enum(["openai", "gemini"]).default("openai"),
  OPENAI_API_KEY: optionalString,
  OPENAI_MODEL: z.string().default("gpt-5-mini"),
  GEMINI_API_KEY: optionalString,
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),

  MAX_QUERY_EXECUTION_TIME: z.coerce.number().int().positive().default(5000),
  MAX_RESULT_ROWS: z.coerce.number().int().positive().default(1000),

  VERCEL: optionalString,
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${details}`);
}

const DEV_JWT_SECRET = "dev-only-secret-change-me";

if (!parsed.data.JWT_SECRET) {
  if (parsed.data.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }
  console.warn("⚠️  JWT_SECRET is not set - using an insecure development secret");
}

export const env = {
  ...parsed.data,
  JWT_SECRET: parsed.data.JWT_SECRET ?? DEV_JWT_SECRET,
  isProduction: parsed.data.NODE_ENV === "production",
  isServerless: Boolean(parsed.data.VERCEL),
};

export type Env = typeof env;
