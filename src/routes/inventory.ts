// Inventory routes. All three endpoints require authentication. Updating stock
// levels is further restricted to owners and managers — floor staff can view
// inventory but can't make changes.

import { Router } from "express";
import { InventoryController } from "../controllers/inventory";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { UserRole } from "../utils";

const router = Router();
const controller = new InventoryController();

router.get(
  "/variant/:variantId",
  authenticate,
  controller.getVariantInventory.bind(controller),
);

router.put(
  "/variant/:variantId",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  controller.updateInventory.bind(controller),
);

router.get("/low-stock", authenticate, controller.lowStock.bind(controller));

export default router;
