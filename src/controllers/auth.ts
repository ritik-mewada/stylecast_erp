import { Request, Response } from "express";
import { AuthService } from "../services/auth";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    const {
      brandName,
      brandSlug,
      companyInfo,
      website,
      shippingOrigin,
      brandCategory,
      contactEmail,
      contactPhone,
      firstName,
      lastName,
      email,
      password,
    } = req.body;
    try {
      const result = await authService.register({
        brandName,
        brandSlug,
        companyInfo,
        website,
        shippingOrigin,
        brandCategory,
        contactEmail,
        contactPhone,
        firstName,
        lastName,
        email,
        password,
      });
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Registration failed",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Login failed",
      });
    }
  }
}
