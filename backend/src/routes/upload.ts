import { RequestHandler, Router } from "express";
import multer from "multer";
import { UploadController } from "../controllers/upload";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/role";
import { uuidParam } from "../middleware/validate";
import { MAX_UPLOAD_BYTES } from "../services/upload";
import { AppError } from "../utils/AppError";
import { UserRole } from "../utils";

const router = Router();
const controller = new UploadController();

router.param("id", uuidParam);

// One file in the "file" field, held in memory (it goes straight to the DB).
const multerSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
}).single("file");

const singleFile: RequestHandler = (req, res, next) => {
  multerSingle(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      return next(
        err.code === "LIMIT_FILE_SIZE"
          ? new AppError(413, "Images can be at most 5 MB")
          : new AppError(400, `Upload error: ${err.message}`),
      );
    }
    next(err);
  });
};

router.post(
  "/",
  authenticate,
  authorizeRoles(UserRole.BRAND_OWNER, UserRole.BRAND_MANAGER),
  singleFile,
  (req, res, next) => controller.create(req, res, next),
);

router.get("/:id", (req, res, next) => controller.serve(req, res, next));

export default router;
