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

export default router;
