// Defines the public auth routes — registration and login. These are the only
// two endpoints that don't require a JWT token to access.

import { Router } from "express";
import { AuthController } from "../controllers/auth";

const router = Router();
const authController = new AuthController();

router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

export default router;
