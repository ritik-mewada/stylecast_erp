import { Response, NextFunction } from "express";
import { BrandService } from "../services/brand";
import { AuthRequest } from "../middleware/auth";
import { BrandApprovalStatus } from "../entity/Brand";
import { AppError } from "../utils/AppError";

const brandService = new BrandService();

export class BrandController {
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await brandService.getMyBrand(req.user!.brandId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await brandService.updateBrandProfile(
        req.user!.brandId,
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
      const id = String(req.params.id);
      const { approvalStatus } = req.body as { approvalStatus: BrandApprovalStatus };

      const validStatuses = Object.values(BrandApprovalStatus);
      if (!validStatuses.includes(approvalStatus)) {
        return next(
          new AppError(
            400,
            `Invalid approval status. Must be one of: ${validStatuses.join(", ")}`,
          ),
        );
      }

      const result = await brandService.updateApprovalStatus(id, approvalStatus);
      res.status(200).json({
        message: `Brand approval status updated to '${approvalStatus}'`,
        brand: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
