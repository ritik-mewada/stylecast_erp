import { Router } from "express";
import { BrandController } from "../controllers/brand";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { validate } from "../middleware/validate";
import { UpdateBrandDto } from "../dto/UpdateBrandDto";
import { UserRole } from "../utils";

const router = Router();
const brandController = new BrandController();

router.get(
  "/me",
  authenticate,
  (req, res, next) => brandController.getMe(req, res, next),
);

router.put(
  "/profile",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  validate(UpdateBrandDto),
  (req, res, next) => brandController.updateProfile(req, res, next),
);

router.patch(
  "/:id/approval",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER),
  (req, res, next) => brandController.updateApproval(req, res, next),
);

export default router;
