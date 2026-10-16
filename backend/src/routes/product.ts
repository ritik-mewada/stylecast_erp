import { Router } from "express";
import { ProductController } from "../controllers/product";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { validate } from "../middleware/validate";
import { CreateProductDto } from "../dto/CreateProductDto";
import { UpdateProductDto } from "../dto/UpdateProductDto";
import { UserRole } from "../utils";

const router = Router();
const productController = new ProductController();

router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  validate(CreateProductDto),
  (req, res, next) => productController.create(req, res, next),
);

router.get(
  "/",
  authenticate,
  authorizeRoles(
    UserRole.BRAND_OWNER,
    UserRole.BRAND_MANAGER,
    UserRole.OPERATIONS_MANAGER,
  ),
  (req, res, next) => productController.getAll(req, res, next),
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles(
    UserRole.BRAND_OWNER,
    UserRole.BRAND_MANAGER,
    UserRole.OPERATIONS_MANAGER,
  ),
  (req, res, next) => productController.getOne(req, res, next),
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  validate(UpdateProductDto),
  (req, res, next) => productController.update(req, res, next),
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  (req, res, next) => productController.archive(req, res, next),
);

export default router;
