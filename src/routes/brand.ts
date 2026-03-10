import { Router } from "express";
import { BrandController } from "../controllers/brand";
import { authenticate } from "../middleware/auth";

const router = Router();
const brandController = new BrandController();

router.get("/me", authenticate, (req, res) => brandController.getMe(req, res));
router.put("/profile", authenticate, (req, res) =>
  brandController.updateProfile(req, res),
);

export default router;
