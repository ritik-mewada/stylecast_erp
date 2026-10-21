import { Response, NextFunction } from "express";
import { BrandService } from "../services/brand";
import { AuthRequest } from "../middleware/auth";
import { getBrandId } from "../utils/brand";
import { BrandApprovalStatus } from "../entity/Brand";
import { enumQuery } from "../utils/query";

const brandService = new BrandService();

export class BrandController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const result = await brandService.listBrands(
        enumQuery(status, BrandApprovalStatus, "status"),
        page,
        limit,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async stats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await brandService.getPlatformStats();
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await brandService.getMyBrand(getBrandId(req));
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await brandService.updateBrandProfile(
        getBrandId(req),
        req.body,
      );
      res.status(200).json({
        message: "Brand profile updated successfully",
        brand: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateApproval(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { approvalStatus } = req.body as { approvalStatus: BrandApprovalStatus };
      const result = await brandService.updateApprovalStatus(
        String(req.params.id),
        approvalStatus,
      );
      res.status(200).json({
        message: `Brand approval status updated to '${approvalStatus}'`,
        brand: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
