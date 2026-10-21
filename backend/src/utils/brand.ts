// Reads the caller's brand from the verified token. Platform admins have no
// brand, so any brand-scoped handler that somehow receives one fails with 403
// instead of running a query with a null brandId. Routes already block admins
// with authorizeRoles(); this is the second line of defence.

import { AuthRequest } from "../middleware/auth";
import { AppError } from "./AppError";

export const getBrandId = (req: AuthRequest): string => {
  const brandId = req.user?.brandId;
  if (!brandId) {
    throw new AppError(403, "This action requires a brand account");
  }
  return brandId;
};
