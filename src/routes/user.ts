import { Router } from "express";
import { UserController } from "../controllers/user";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { UserRole } from "../utils";

const router = Router();
const controller = new UserController();

router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER),
  controller.create.bind(controller),
);

router.get(
  "/",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  controller.list.bind(controller),
);

export default router;
