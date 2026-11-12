/**
 * MongoDB connection (assignments, users, progress).
 *
 * The connection promise is cached on globalThis so warm serverless invocations
 * and the long-running dev server share a single connection.
 *
 * Author: Gourav Chaudhary
 */

import mongoose from "mongoose";
import { env } from "../config/env.js";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = (globalThis.__mongooseCache ??= { conn: null, promise: null });

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  cache.promise ??= mongoose.connect(env.MONGODB_URI, { bufferCommands: false });

  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.conn;
}
