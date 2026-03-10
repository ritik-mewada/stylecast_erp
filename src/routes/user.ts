import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/me", authenticate, (req: AuthRequest, res) => {
  return res.json({
    message: "Authenticated user",
    user: req.user,
  });
});

export default router;
