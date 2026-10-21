import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { getBrandId } from "../utils/brand";
import { UploadService } from "../services/upload";
import { AppError } from "../utils/AppError";
import { Config } from "../config";

const uploadService = new UploadService();

// Absolute URL of an upload, usable directly as an <img src> and as a
// product imageUrl. PUBLIC_URL wins when set; otherwise it comes from the
// request (behind a proxy, set TRUST_PROXY so the protocol is right).
const uploadUrl = (req: Request, id: string) => {
  const base = Config.PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
  return `${base}/api/v1/uploads/${id}`;
};

export class UploadController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, "Attach an image in the 'file' field");
      }
      const result = await uploadService.createUpload(getBrandId(req), req.file.buffer);
      res.status(201).json({ ...result, url: uploadUrl(req, result.id) });
    } catch (err) {
      next(err);
    }
  }

  // Public: images are referenced by unguessable ids from product pages, and
  // <img> tags can't send a bearer token. Ids never change content, so the
  // response can be cached forever.
  async serve(req: Request, res: Response, next: NextFunction) {
    try {
      const upload = await uploadService.getUpload(String(req.params.id));
      res.set({
        "Content-Type": upload.contentType,
        "Content-Length": String(upload.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        // Helmet defaults to same-origin; the dashboard is on another origin.
        "Cross-Origin-Resource-Policy": "cross-origin",
      });
      res.status(200).send(upload.data);
    } catch (err) {
      next(err);
    }
  }
}
