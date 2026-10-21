import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { validate } from "../middleware/validate";
import { RecordTrafficDto } from "../dto/RecordTrafficDto";
import { BRAND_ROLES, UserRole } from "../utils";

const router = Router();
const controller = new AnalyticsController();

const allRoles = BRAND_ROLES;

router.get(
  "/overview",
  authenticate,
  authorizeRoles(...allRoles),
  (req, res, next) => controller.overview(req, res, next),
);

router.get(
  "/top-products",
  authenticate,
  authorizeRoles(...allRoles),
  (req, res, next) => controller.topProducts(req, res, next),
);

router.get(
  "/low-stock",
  authenticate,
  authorizeRoles(...allRoles),
  (req, res, next) => controller.lowStock(req, res, next),
);

router.get(
  "/order-status",
  authenticate,
  authorizeRoles(...allRoles),
  (req, res, next) => controller.orderStatus(req, res, next),
);

router.get(
  "/inventory-turnover",
  authenticate,
  authorizeRoles(...allRoles),
  (req, res, next) => controller.inventoryTurnover(req, res, next),
);

router.get(
  "/conversion-rate",
  authenticate,
  authorizeRoles(...allRoles),
  (req, res, next) => controller.conversionRate(req, res, next),
);

router.get(
  "/sales-series",
  authenticate,
  authorizeRoles(...allRoles),
  (req, res, next) => controller.salesSeries(req, res, next),
);

router.post(
  "/traffic",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  validate(RecordTrafficDto),
  (req, res, next) => controller.recordTraffic(req, res, next),
);

export default router;
