// Role-based access control middleware. After the auth middleware has verified
// the token, this checks whether the user's role is in the list of allowed roles
// for a given route. Returns 403 if they don't have permission.

import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};
