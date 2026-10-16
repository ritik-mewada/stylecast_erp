import { Response, NextFunction } from "express";
import { InventoryService } from "../services/inventory";
import { AuthRequest } from "../middleware/auth";

const inventoryService = new InventoryService();

export class InventoryController {
  async getVariantInventory(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const inventory = await inventoryService.getInventoryByVariant(
        String(req.params.variantId),
      );
      res.status(200).json(inventory);
    } catch (err) {
      next(err);
    }
  }

  async updateInventory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await inventoryService.updateInventory(
        String(req.params.variantId),
        req.body,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async lowStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await inventoryService.getLowStockItems(
        req.user!.brandId,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
