/**
 * Application entry point.
 *
 * Initialises the database connection then starts the HTTP server.
 * Unhandled promise rejections and uncaught exceptions are captured at the
 * process level so no error silently swallows itself.
 */
import app from "./app";
import { Config } from "./config";
import { AppDataSource } from "./data-source";

// Catch uncaught synchronous exceptions before they crash silently
process.on("uncaughtException", (err: Error) => {
  console.error("💥 Uncaught Exception:", err.message);
  process.exit(1);
});

const startServer = async (): Promise<void> => {
  const PORT = Config.PORT;
  try {
    await AppDataSource.initialize();
    console.log("✅  Database connection established.");
    app.listen(PORT, () =>
      console.log(
        `🚀  StyleCast ERP API listening on port ${PORT} [${Config.NODE_ENV}]`,
      ),
    );
  } catch (err) {
    console.error(
      "❌  Failed to connect to database:",
      err instanceof Error ? err.message : err,
    );
    process.exit(1);
  }
};

// Catch async rejections that escape the try/catch above
process.on("unhandledRejection", (reason: unknown) => {
  console.error("💥 Unhandled Rejection:", reason);
  process.exit(1);
});

void startServer();
