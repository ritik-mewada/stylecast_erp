import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { getBrandId } from "../utils/brand";
import { AnalyticsService } from "../services/analytics";

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async overview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const range = req.query.range as string | undefined;
      const result = await analyticsService.getOverview(
        getBrandId(req),
        range,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async topProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 5;
      const range = req.query.range as string | undefined;
      const result = await analyticsService.getTopProducts(
        getBrandId(req),
        limit,
        range,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async lowStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.getLowStockSummary(
        getBrandId(req),
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async orderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const range = req.query.range as string | undefined;
      const result = await analyticsService.getOrderStatusSummary(
        getBrandId(req),
        range,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async inventoryTurnover(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const range = req.query.range as string | undefined;
      const result = await analyticsService.getInventoryTurnover(
        getBrandId(req),
        range,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async conversionRate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const range = req.query.range as string | undefined;
      const result = await analyticsService.getConversionRate(
        getBrandId(req),
        range,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
