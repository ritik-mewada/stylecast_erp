import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { getBrandId } from "../utils/brand";
import { AnalyticsService } from "../services/analytics";
import { ANALYTICS_RANGES } from "../utils/analytics-range";
import { enumQuery } from "../utils/query";

const analyticsService = new AnalyticsService();

const rangeOf = (req: AuthRequest) => enumQuery(req.query.range, ANALYTICS_RANGES, "range");

export class AnalyticsController {
  async overview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.getOverview(getBrandId(req), rangeOf(req));
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async topProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 5;
      const result = await analyticsService.getTopProducts(
        getBrandId(req),
        limit,
        rangeOf(req),
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async lowStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.getLowStockSummary(getBrandId(req));
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async orderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.getOrderStatusSummary(
        getBrandId(req),
        rangeOf(req),
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
      const result = await analyticsService.getInventoryTurnover(
        getBrandId(req),
        rangeOf(req),
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async conversionRate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.getConversionRate(
        getBrandId(req),
        rangeOf(req),
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async salesSeries(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const days = Math.min(Math.max(Math.floor(Number(req.query.days)) || 30, 1), 365);
      const result = await analyticsService.getSalesSeries(getBrandId(req), days);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async recordTraffic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.recordTraffic(getBrandId(req), req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
