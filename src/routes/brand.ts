// Routes for brand profile management. Fetching the current brand's info is open
// to any authenticated user, but updating the profile is locked down to owners
// and managers only. The approval route is restricted to brand owners.

import { Router } from "express";
import { BrandController } from "../controllers/brand";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { UserRole } from "../utils";

const router = Router();
const brandController = new BrandController();

router.get("/me", authenticate, brandController.getMe.bind(brandController));

router.put(
  "/profile",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  brandController.updateProfile.bind(brandController),
);

router.patch(
  "/:id/approval",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER),
  brandController.updateApproval.bind(brandController),
);

export default router;
