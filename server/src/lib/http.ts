/**
 * HTTP helpers shared by all routes.
 *
 * Express 5 forwards rejected promises from async handlers to the error
 * handler, so routes can simply `throw new HttpError(...)`.
 *
 * Author: Gourav Chaudhary
 */

import type { ErrorRequestHandler, RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { env } from "../config/env.js";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

/** Validate a request body/query with zod, turning failures into a 400. */
export function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data ?? {});
  if (!result.success) {
    throw new HttpError(400, result.error.issues[0]?.message ?? "Invalid request");
  }
  return result.data;
}

/** zod schema for a MongoDB ObjectId string. */
export const objectId = (label: string) =>
  z.string({ error: `${label} is required` }).refine(isValidObjectId, `${label} is invalid`);

export const notFound: RequestHandler = (req) => {
  throw new HttpError(404, `Route not found: ${req.method} ${req.path}`);
};

/**
 * Every error response carries both `message` and `error` with the same text,
 * so clients written against either convention keep working.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ success: false, message: err.message, error: err.message });
    return;
  }

  // Malformed JSON body
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ success: false, message: "Invalid JSON body", error: "Invalid JSON body" });
    return;
  }

  console.error("❌ Unhandled error:", err);
  const message = "Internal server error";
  res.status(500).json({
    success: false,
    message,
    error: env.isProduction ? message : err instanceof Error ? err.message : String(err),
  });
};
