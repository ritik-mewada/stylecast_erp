/**
 * JWT authentication middleware.
 *
 * Verifies the Bearer token from the Authorization header, then loads the
 * user it belongs to and attaches their current id, brand, role and email to
 * req.user. All protected routes should use this.
 *
 * Loading the user (one primary-key lookup) is what makes a token revocable:
 * it stops working once the account is removed or its tokenVersion is bumped
 * by a password change or reset, and a role change applies on the next
 * request instead of when the token expires.
 */
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isUUID } from "class-validator";
import { Config } from "../config";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { UserRole } from "../utils";
import { TokenPayload } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    brandId: string | null;
    role: UserRole;
    email: string;
  };
}

const unauthorized = (res: Response, message: string) => {
  res.status(401).json({ status: "error", message });
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    unauthorized(res, "Authorization token required");
    return;
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, Config.JWT_SECRET) as TokenPayload;
  } catch {
    unauthorized(res, "Invalid or expired token");
    return;
  }

  // TypeORM drops undefined conditions, so a token without a userId would
  // otherwise match any user (and a non-UUID would be a database error).
  if (!isUUID(payload.userId)) {
    unauthorized(res, "Invalid or expired token");
    return;
  }

  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: payload.userId },
      select: ["id", "brandId", "role", "email", "tokenVersion"],
    });

    if (!user || user.tokenVersion !== (payload.tokenVersion ?? 0)) {
      unauthorized(res, "Your session has ended. Please sign in again.");
      return;
    }

    req.user = { userId: user.id, brandId: user.brandId, role: user.role, email: user.email };
    next();
  } catch (error) {
    next(error);
  }
};
