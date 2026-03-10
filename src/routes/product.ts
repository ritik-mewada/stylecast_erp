import { Router } from "express";
import { ProductController } from "../controllers/product";
import { authenticate } from "../middleware/auth";

const router = Router();
const productController = new ProductController();

router.post("/", authenticate, (req, res) =>
  productController.create(req, res),
);
router.get("/", authenticate, (req, res) => productController.getAll(req, res));
router.get("/:id", authenticate, (req, res) =>
  productController.getOne(req, res),
);
router.put("/:id", authenticate, (req, res) =>
  productController.update(req, res),
);
router.delete("/:id", authenticate, (req, res) =>
  productController.archive(req, res),
);

export default router;
