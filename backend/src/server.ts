/**
 * Application entry point.
 *
 * Initialises the database connection then starts the HTTP server.
 * Unhandled promise rejections and uncaught exceptions are logged with their
 * stack and end the process, so the host restarts it in a clean state.
 *
 * On SIGTERM (a redeploy or scale-down) or SIGINT (Ctrl+C) the server stops
 * accepting connections, lets in-flight requests finish, closes the database
 * pool and exits. If that takes longer than 10 seconds it exits anyway.
 */
import { Server } from "http";
import app from "./app";
import { Config } from "./config";
import { AppDataSource } from "./data-source";

const SHUTDOWN_TIMEOUT_MS = 10_000;

// Catch uncaught synchronous exceptions before they crash silently
process.on("uncaughtException", (err: Error) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

// Catch async rejections that escape the try/catch blocks
process.on("unhandledRejection", (reason: unknown) => {
  console.error("💥 Unhandled Rejection:", reason);
  process.exit(1);
});

let server: Server | undefined;
let shuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`🛑  ${signal} received, finishing open requests…`);

  setTimeout(() => {
    console.error("⏱️  Shutdown took too long; exiting.");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();

  try {
    if (server) {
      const closing = new Promise<void>((resolve, reject) =>
        server!.close((err) => (err ? reject(err) : resolve())),
      );
      // close() waits for every connection; drop keep-alive connections as soon
      // as their last response is sent instead of waiting for them to time out.
      const sweep = setInterval(() => server!.closeIdleConnections(), 100);
      await closing.finally(() => clearInterval(sweep));
    }
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    console.log("👋  Shut down cleanly.");
    process.exit(0);
  } catch (err) {
    console.error("💥 Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

const startServer = async (): Promise<void> => {
  const PORT = Config.PORT;
  try {
    await AppDataSource.initialize();
    console.log("✅  Database connection established.");
    server = app.listen(PORT, () =>
      console.log(
        `🚀  StyleCast ERP API listening on port ${PORT} [${Config.NODE_ENV}]`,
      ),
    );
  } catch (err) {
    console.error("❌  Failed to connect to database:", err);
    process.exit(1);
  }
};

void startServer();
