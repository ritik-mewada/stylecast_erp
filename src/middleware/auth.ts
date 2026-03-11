/**
 * JWT authentication middleware.
 *
 * Verifies the Bearer token from the Authorization header and attaches the
 * decoded payload to req.user.  All protected routes should use this.
 */
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Config } from "../config";
import { UserRole } from "../utils";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    brandId: string;
    role: UserRole;
    email: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ status: "error", message: "Authorization token required" });
    return;
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const decoded = jwt.verify(token, Config.JWT_SECRET) as AuthRequest["user"];
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ status: "error", message: "Invalid or expired token" });
  }
};
