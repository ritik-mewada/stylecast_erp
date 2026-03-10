import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { UserRole } from "../utils";

const router = Router();
const controller = new AnalyticsController();

router.get(
  "/overview",
  authenticate,
  authorizeRoles(
    UserRole.BRAND_OWNER,
    UserRole.BRAND_MANAGER,
    UserRole.OPERATIONS_MANAGER,
  ),
  controller.overview.bind(controller),
);

router.get(
  "/top-products",
  authenticate,
  authorizeRoles(
    UserRole.BRAND_OWNER,
    UserRole.BRAND_MANAGER,
    UserRole.OPERATIONS_MANAGER,
  ),
  controller.topProducts.bind(controller),
);

router.get(
  "/low-stock",
  authenticate,
  authorizeRoles(
    UserRole.BRAND_OWNER,
    UserRole.BRAND_MANAGER,
    UserRole.OPERATIONS_MANAGER,
  ),
  controller.lowStock.bind(controller),
);

router.get(
  "/order-status",
  authenticate,
  authorizeRoles(
    UserRole.BRAND_OWNER,
    UserRole.BRAND_MANAGER,
    UserRole.OPERATIONS_MANAGER,
  ),
  controller.orderStatus.bind(controller),
);

router.get(
  "/inventory-turnover",
  authenticate,
  authorizeRoles(
    UserRole.BRAND_OWNER,
    UserRole.BRAND_MANAGER,
    UserRole.OPERATIONS_MANAGER,
  ),
  controller.inventoryTurnover.bind(controller),
);

router.get(
  "/conversion-rate",
  authenticate,
  authorizeRoles(
    UserRole.BRAND_OWNER,
    UserRole.BRAND_MANAGER,
    UserRole.OPERATIONS_MANAGER,
  ),
  controller.conversionRate.bind(controller),
);

export default router;
