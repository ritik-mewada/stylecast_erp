import { Router } from "express";
import { OrderController } from "../controllers/order";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { uuidParam, validate } from "../middleware/validate";
import { UpdateOrderStatusDto } from "../dto/UpdateOrderStatusDto";
import { BRAND_ROLES, UserRole } from "../utils";

const router = Router();
const orderController = new OrderController();

router.param("id", uuidParam);

router.get(
  "/",
  authenticate,
  authorizeRoles(...BRAND_ROLES),
  (req, res, next) => orderController.getAll(req, res, next),
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles(...BRAND_ROLES),
  (req, res, next) => orderController.getOne(req, res, next),
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.OPERATIONS_MANAGER),
  validate(UpdateOrderStatusDto),
  (req, res, next) => orderController.updateStatus(req, res, next),
);

router.patch(
  "/:id/refund",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.OPERATIONS_MANAGER),
  (req, res, next) => orderController.refund(req, res, next),
);

export default router;
