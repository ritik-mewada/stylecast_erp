import { Router } from "express";
import { UserController } from "../controllers/user";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { validate } from "../middleware/validate";
import { CreateUserDto } from "../dto/CreateUserDto";
import { UserRole } from "../utils";

const router = Router();
const controller = new UserController();

router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER),
  validate(CreateUserDto),
  (req, res, next) => controller.create(req, res, next),
);

router.get(
  "/",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  (req, res, next) => controller.list(req, res, next),
);

export default router;
