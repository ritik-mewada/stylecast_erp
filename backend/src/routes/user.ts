import { Router } from "express";
import { UserController } from "../controllers/user";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { uuidParam, validate } from "../middleware/validate";
import { CreateUserDto } from "../dto/CreateUserDto";
import { UpdateMeDto } from "../dto/UpdateMeDto";
import { ChangePasswordDto } from "../dto/ChangePasswordDto";
import { UpdateUserRoleDto } from "../dto/UpdateUserRoleDto";
import { UserRole } from "../utils";

const router = Router();
const controller = new UserController();

router.param("id", uuidParam);

// Account endpoints work for every role, platform admins included.
const anyRole = Object.values(UserRole);

router.get(
  "/me",
  authenticate,
  authorizeRoles(...anyRole),
  (req, res, next) => controller.getMe(req, res, next),
);

router.put(
  "/me",
  authenticate,
  authorizeRoles(...anyRole),
  validate(UpdateMeDto),
  (req, res, next) => controller.updateMe(req, res, next),
);

router.put(
  "/me/password",
  authenticate,
  authorizeRoles(...anyRole),
  validate(ChangePasswordDto),
  (req, res, next) => controller.changePassword(req, res, next),
);

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

router.patch(
  "/:id/role",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER),
  validate(UpdateUserRoleDto),
  (req, res, next) => controller.updateRole(req, res, next),
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER),
  (req, res, next) => controller.remove(req, res, next),
);

export default router;
