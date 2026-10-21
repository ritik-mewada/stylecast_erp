/**
 * Rate limits for the public auth endpoints, keyed by client IP.
 *
 * - Login: 10 failed attempts per IP per 15 minutes. Successful sign-ins
 *   don't count, so a busy office behind one IP isn't locked out.
 * - Forgot password: 5 requests per IP per 15 minutes, since each one can
 *   send an email.
 *
 * Counters live in memory, which is fine for a single instance; several
 * instances would need a shared store (e.g. Redis). Behind a proxy or load
 * balancer, set TRUST_PROXY so the client IP is read correctly.
 */
import { rateLimit } from "express-rate-limit";
import { Config } from "../config";

const WINDOW_MS = 15 * 60 * 1000;

const tooMany = (message: string) => ({ status: "error", message });

export const loginLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: Config.LOGIN_RATE_LIMIT,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooMany("Too many failed sign-in attempts. Try again in 15 minutes."),
});

export const passwordResetLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: tooMany("Too many password reset requests. Try again in 15 minutes."),
});
