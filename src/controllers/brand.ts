// Manages brand profile endpoints. Right now it supports fetching the current
// brand's info, updating the profile, and managing approval status.
// Only authenticated users can access these, and you can only modify your own
// brand's data (or approve/reject brands if you're an owner).

import { Response } from "express";
import { BrandService } from "../services/brand";
import { AuthRequest } from "../middleware/auth";
import { BrandApprovalStatus } from "../entity/Brand";

const brandService = new BrandService();

export class BrandController {
  async getMe(req: AuthRequest, res: Response) {
    try {
      const result = await brandService.getMyBrand(req.user!.brandId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(404).json({
        message: error.message || "Failed to fetch brand profile",
      });
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const result = await brandService.updateBrandProfile(
        req.user!.brandId,
        req.body,
      );

      return res.status(200).json({
        message: "Brand profile updated successfully",
        brand: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to update brand profile",
      });
    }
  }

  async updateApproval(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { approvalStatus } = req.body as { approvalStatus: BrandApprovalStatus };

      const validStatuses = Object.values(BrandApprovalStatus);
      if (!validStatuses.includes(approvalStatus)) {
        return res.status(400).json({
          message: `Invalid approval status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const result = await brandService.updateApprovalStatus(id, approvalStatus);

      return res.status(200).json({
        message: `Brand approval status updated to '${approvalStatus}'`,
        brand: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to update approval status",
      });
    }
  }
}
