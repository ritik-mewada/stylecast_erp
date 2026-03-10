import { Response } from "express";
import { InventoryService } from "../services/inventory";
import { AuthRequest } from "../middleware/auth";

const inventoryService = new InventoryService();

export class InventoryController {
  async getVariantInventory(req: AuthRequest, res: Response) {
    try {
      const inventory = await inventoryService.getInventoryByVariant(
        String(req.params.variantId),
      );

      return res.json(inventory);
    } catch (error: any) {
      return res.status(404).json({
        message: error.message,
      });
    }
  }

  async updateInventory(req: AuthRequest, res: Response) {
    try {
      const result = await inventoryService.updateInventory(
        String(req.params.variantId),
        req.body,
      );

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  async lowStock(req: AuthRequest, res: Response) {
    try {
      const result = await inventoryService.getLowStockItems(req.user!.brandId);

      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }
}
