import { Router } from "express";
import { InventoryController } from "../controllers/inventory";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { validate } from "../middleware/validate";
import { UpdateInventoryDto } from "../dto/UpdateInventoryDto";
import { UserRole } from "../utils";

const router = Router();
const controller = new InventoryController();

router.get(
  "/variant/:variantId",
  authenticate,
  (req, res, next) => controller.getVariantInventory(req, res, next),
);

router.put(
  "/variant/:variantId",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  validate(UpdateInventoryDto),
  (req, res, next) => controller.updateInventory(req, res, next),
);

router.get(
  "/low-stock",
  authenticate,
  (req, res, next) => controller.lowStock(req, res, next),
);

export default router;
