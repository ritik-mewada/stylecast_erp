import { Response, NextFunction } from "express";
import { InventoryService } from "../services/inventory";
import { AuthRequest } from "../middleware/auth";
import { getBrandId } from "../utils/brand";
import { enumQuery, stringQuery } from "../utils/query";

const inventoryService = new InventoryService();

const STOCK_FILTERS = { LOW: "low", OUT: "out" } as const;

export class InventoryController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status, search } = req.query;
      const result = await inventoryService.listInventory(
        getBrandId(req),
        page,
        limit,
        {
          status: enumQuery(status, STOCK_FILTERS, "status"),
          search: stringQuery(search),
        },
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getVariantInventory(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const inventory = await inventoryService.getInventoryByVariant(
        String(req.params.variantId),
        getBrandId(req),
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
        getBrandId(req),
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
        getBrandId(req),
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
