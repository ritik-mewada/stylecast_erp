import { Router } from "express";
import { ShippingController } from "../controllers/shipping";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { validate } from "../middleware/validate";
import { CreateShippingRuleDto } from "../dto/CreateShippingRuleDto";
import { UpdateShippingRuleDto } from "../dto/UpdateShippingRuleDto";
import { UserRole } from "../utils";

const router = Router();
const controller = new ShippingController();

router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  validate(CreateShippingRuleDto),
  (req, res, next) => controller.create(req, res, next),
);

router.get(
  "/",
  authenticate,
  (req, res, next) => controller.list(req, res, next),
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  validate(UpdateShippingRuleDto),
  (req, res, next) => controller.update(req, res, next),
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER),
  (req, res, next) => controller.delete(req, res, next),
);

export default router;
