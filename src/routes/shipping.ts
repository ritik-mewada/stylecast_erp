// Shipping rule routes. Creating and editing rules needs owner or manager access.
// Listing rules is open to all authenticated users, but deleting a rule is
// only allowed for brand owners since it's a more sensitive operation.

import { Router } from "express";
import { ShippingController } from "../controllers/shipping";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { UserRole } from "../utils";

const router = Router();
const controller = new ShippingController();

router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  controller.create.bind(controller),
);

router.get("/", authenticate, controller.list.bind(controller));

router.put(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  controller.update.bind(controller),
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER),
  controller.delete.bind(controller),
);

export default router;
