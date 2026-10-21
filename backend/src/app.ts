/**
 * Express application setup.
 *
 * Middleware stack, route mounting, 404 handler, and global error handler are
 * all wired up here.  Routes are versioned under /api/v1.
 */
import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { Config } from "./config";
import { globalErrorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import brandRoutes from "./routes/brand";
import productRoutes from "./routes/product";
import inventoryRoutes from "./routes/inventory";
import orderRoutes from "./routes/order";
import shippingRoutes from "./routes/shipping";
import analyticsRoutes from "./routes/analytics";
import uploadRoutes from "./routes/upload";
import { setupSwagger } from "./config/swagger";
import { AppError } from "./utils/AppError";
import { AppDataSource } from "./data-source";

const app = express();

// Behind a load balancer, this makes req.ip and req.protocol come from the
// X-Forwarded-* headers (needed for rate limiting and upload URLs).
app.set("trust proxy", Config.TRUST_PROXY);

// ─── Security ────────────────────────────────────────────────────────────────

app.use(helmet());

// CORS — restrict to configured origins in production
const allowedOrigins = Config.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
app.use(
  cors({
    origin:
      allowedOrigins.length === 1 && allowedOrigins[0] === "*"
        ? "*"
        : (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new AppError(403, "Not allowed by CORS"));
            }
          },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ─── Request Parsing ─────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Logging ─────────────────────────────────────────────────────────────────

app.use(morgan(Config.NODE_ENV === "production" ? "combined" : "dev"));

// ─── Health check ────────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "StyleCast ERP API" });
});

// For uptime checks and the host's health check: 503 when the database
// can't be reached, so a broken instance is taken out of rotation.
app.get("/health", async (_req, res) => {
  try {
    await AppDataSource.query("SELECT 1");
    res.json({ status: "ok", database: "up", uptime: Math.round(process.uptime()) });
  } catch {
    res.status(503).json({ status: "error", database: "down" });
  }
});

// ─── API Routes (versioned) ──────────────────────────────────────────────────

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/shipping", shippingRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/uploads", uploadRoutes);

// ─── Swagger ─────────────────────────────────────────────────────────────────

setupSwagger(app);

// ─── 404 catch-all ───────────────────────────────────────────────────────────

app.use((_req, _res, next) => {
  next(new AppError(404, "Route not found"));
});

// ─── Global Error Handler ────────────────────────────────────────────────────

app.use(globalErrorHandler);

export default app;
