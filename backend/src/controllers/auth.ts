import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  // Always 200 with the same message, and the email is sent after the
  // response so timing doesn't reveal whether the account exists either.
  async forgotPassword(req: Request, res: Response) {
    res.status(200).json({
      message: "If an account exists for that email, we've sent a link to reset the password.",
    });
    authService.requestPasswordReset(req.body.email).catch((err) => {
      console.error("💥 Password reset email failed:", err);
    });
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
