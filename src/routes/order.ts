import { Router } from "express";
import { OrderController } from "../controllers/order";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { UserRole } from "../utils";

const router = Router();
const orderController = new OrderController();

router.get(
  "/",
  authenticate,
  authorizeRoles(
    UserRole.BRAND_OWNER,
    UserRole.BRAND_MANAGER,
    UserRole.OPERATIONS_MANAGER,
  ),
  orderController.getAll.bind(orderController),
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    UserRole.BRAND_OWNER,
    UserRole.BRAND_MANAGER,
    UserRole.OPERATIONS_MANAGER,
  ),
  orderController.getOne.bind(orderController),
);

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.OPERATIONS_MANAGER),
  orderController.updateStatus.bind(orderController),
);

router.patch(
  "/:id/refund",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.OPERATIONS_MANAGER),
  orderController.refund.bind(orderController),
);

export default router;
