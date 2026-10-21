import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { validate } from "../middleware/validate";
import { loginLimiter, passwordResetLimiter, registerLimiter } from "../middleware/rateLimit";
import { RegisterDto } from "../dto/RegisterDto";
import { LoginDto } from "../dto/LoginDto";
import { ForgotPasswordDto } from "../dto/ForgotPasswordDto";
import { ResetPasswordDto } from "../dto/ResetPasswordDto";

const router = Router();
const authController = new AuthController();

router.post(
  "/register",
  registerLimiter,
  validate(RegisterDto),
  (req, res, next) => authController.register(req, res, next),
);

router.post(
  "/login",
  loginLimiter,
  validate(LoginDto),
  (req, res, next) => authController.login(req, res, next),
);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  validate(ForgotPasswordDto),
  (req, res) => authController.forgotPassword(req, res),
);

router.post(
  "/reset-password",
  validate(ResetPasswordDto),
  (req, res, next) => authController.resetPassword(req, res, next),
);

export default router;
