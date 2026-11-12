/**
 * JWT authentication middleware.
 *
 * - optionalAuth: attaches req.user when a valid token is present (guests allowed)
 * - requireAuth:  401 unless a valid token is present
 * - requireAdmin: 403 unless the user is an admin
 *
 * Author: Gourav Chaudhary
 */

import type { RequestHandler, Request } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../lib/http.js";
import type { Role, UserDocument } from "../models/User.js";

export interface AuthUser {
  userId: string;
  email: string;
  username: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: UserDocument): string {
  const payload: AuthUser = {
    userId: user._id.toString(),
    email: user.email,
    username: user.username,
    role: user.role,
  };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] });
}

function readBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
}

function verify(token: string): AuthUser | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = readBearerToken(req);
  const user = token ? verify(token) : null;
  if (user) req.user = user;
  next();
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = readBearerToken(req);
  if (!token) throw new HttpError(401, "No token provided");

  const user = verify(token);
  if (!user) throw new HttpError(401, "Invalid or expired token");

  req.user = user;
  next();
};

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== "admin") throw new HttpError(403, "Admin access required");
  next();
};

/** Use inside handlers that sit behind requireAuth. */
export function currentUser(req: Request): AuthUser {
  if (!req.user) throw new HttpError(401, "No token provided");
  return req.user;
}
