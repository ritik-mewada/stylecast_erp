import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { validate } from "../middleware/validate";
import { RegisterDto } from "../dto/RegisterDto";
import { LoginDto } from "../dto/LoginDto";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  validate(RegisterDto),
  (req, res, next) => authController.register(req, res, next),
);

router.post(
  "/login",
  validate(LoginDto),
  (req, res, next) => authController.login(req, res, next),
);

export default router;
