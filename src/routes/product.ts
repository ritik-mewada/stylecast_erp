// Product routes. Creating, updating, and archiving products is restricted to
// owners and managers. Reading products is a bit more permissive — operations
// staff can view them too, since they need access for order fulfillment.

import { Router } from "express";
import { ProductController } from "../controllers/product";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { UserRole } from "../utils";

const router = Router();
const productController = new ProductController();

router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  productController.create.bind(productController),
);

router.get(
  "/",
  authenticate,
  authorizeRoles(
    UserRole.BRAND_OWNER,
    UserRole.BRAND_MANAGER,
    UserRole.OPERATIONS_MANAGER,
  ),
  productController.getAll.bind(productController),
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    UserRole.BRAND_OWNER,
    UserRole.BRAND_MANAGER,
    UserRole.OPERATIONS_MANAGER,
  ),
  productController.getOne.bind(productController),
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  productController.update.bind(productController),
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  productController.archive.bind(productController),
);

export default router;
