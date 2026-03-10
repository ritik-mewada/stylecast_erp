import { Response } from "express";
import { BrandService } from "../services/brand";
import { AuthRequest } from "../middleware/auth";

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
}
