/**
 * Application configuration.
 *
 * All environment variables are resolved and validated here at module-load
 * time.  If a required variable is missing the process terminates immediately
 * with a clear message rather than failing silently later.
 */
import "dotenv/config";

// TRUST_PROXY: unset/false = don't trust X-Forwarded-*; a number = that many
// proxy hops (1 behind a single load balancer, e.g. Render or Railway);
// anything else is passed to Express as-is (e.g. "loopback").
function parseTrustProxy(value: string | undefined): boolean | number | string {
  if (!value || value === "false") return false;
  if (value === "true") return true;
  if (/^\d+$/.test(value)) return Number(value);
  return value;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`❌  Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

export const Config = {
  PORT: process.env.PORT || "3000",
  NODE_ENV: process.env.NODE_ENV || "development",

  // Proxy hops to trust for the client IP and protocol (see parseTrustProxy).
  TRUST_PROXY: parseTrustProxy(process.env.TRUST_PROXY),

  // Database. DATABASE_URL (as given by managed Postgres hosts) takes
  // precedence over the DB_* settings. Add ?sslmode=require to it when the
  // database needs TLS.
  DATABASE_URL: process.env.DATABASE_URL || "",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT) || 5432,
  DB_USERNAME: process.env.DB_USERNAME || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "root",
  DB_NAME: process.env.DB_NAME || "stylecast_erp",

  // Auth
  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",

  // Failed sign-in attempts allowed per IP per 15 minutes.
  LOGIN_RATE_LIMIT: Number(process.env.LOGIN_RATE_LIMIT) || 10,

  // CORS – comma-separated list of allowed origins, e.g. "http://localhost:5173,https://app.stylecast.io"
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "*",

  // Public base URL of this API (e.g. https://api.stylecast.example), used for
  // links to uploaded images. Optional: falls back to the request's host.
  PUBLIC_URL: (process.env.PUBLIC_URL || "").replace(/\/+$/, ""),

  // Dashboard base URL, used to build links in emails (password reset).
  APP_URL: (process.env.APP_URL || "http://localhost:5173").replace(/\/+$/, ""),

  // Email. Without SMTP_URL, emails are printed to the console in development
  // and skipped (with a warning) in production.
  SMTP_URL: process.env.SMTP_URL || "",
  MAIL_FROM: process.env.MAIL_FROM || "StyleCast <no-reply@stylecast.example>",
} as const;
