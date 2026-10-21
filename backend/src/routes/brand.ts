import { Router } from "express";
import { BrandController } from "../controllers/brand";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { uuidParam, validate } from "../middleware/validate";
import { UpdateBrandDto } from "../dto/UpdateBrandDto";
import { UpdateBrandApprovalDto } from "../dto/UpdateBrandApprovalDto";
import { BRAND_ROLES, UserRole } from "../utils";

const router = Router();
const brandController = new BrandController();

router.param("id", uuidParam);

router.get(
  "/",
  authenticate,
  authorizeRoles(UserRole.PLATFORM_ADMIN),
  (req, res, next) => brandController.list(req, res, next),
);

router.get(
  "/stats",
  authenticate,
  authorizeRoles(UserRole.PLATFORM_ADMIN),
  (req, res, next) => brandController.stats(req, res, next),
);

router.get(
  "/me",
  authenticate,
  authorizeRoles(...BRAND_ROLES),
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
  authorizeRoles(UserRole.PLATFORM_ADMIN),
  validate(UpdateBrandApprovalDto),
  (req, res, next) => brandController.updateApproval(req, res, next),
);

export default router;
