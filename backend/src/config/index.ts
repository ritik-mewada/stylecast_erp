/**
 * Application configuration.
 *
 * All environment variables are resolved and validated here at module-load
 * time.  If a required variable is missing the process terminates immediately
 * with a clear message rather than failing silently later.
 */
import "dotenv/config";

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

  // Database
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT) || 5432,
  DB_USERNAME: process.env.DB_USERNAME || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "root",
  DB_NAME: process.env.DB_NAME || "stylecast_erp",

  // Auth
  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",

  // CORS – comma-separated list of allowed origins, e.g. "http://localhost:5173,https://app.stylecast.io"
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "*",

  // Dashboard base URL, used to build links in emails (password reset).
  APP_URL: (process.env.APP_URL || "http://localhost:5173").replace(/\/+$/, ""),

  // Email. Without SMTP_URL, emails are printed to the console in development
  // and skipped (with a warning) in production.
  SMTP_URL: process.env.SMTP_URL || "",
  MAIL_FROM: process.env.MAIL_FROM || "StyleCast <no-reply@stylecast.example>",
} as const;
