// Handles all the analytics-related API endpoints — things like the dashboard
// overview, top-selling products, inventory turnover, and conversion rates.
// Each method just grabs what it needs from the analytics service and sends it back.

import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { AnalyticsService } from "../services/analytics";

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async overview(req: AuthRequest, res: Response) {
    try {
      const range = req.query.range as string | undefined;
      const result = await analyticsService.getOverview(
        req.user!.brandId,
        range,
      );
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to fetch overview analytics",
      });
    }
  }

  async topProducts(req: AuthRequest, res: Response) {
    try {
      const limit = Number(req.query.limit) || 5;
      const range = req.query.range as string | undefined;

      const result = await analyticsService.getTopProducts(
        req.user!.brandId,
        limit,
        range,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to fetch top products",
      });
    }
  }

  async lowStock(req: AuthRequest, res: Response) {
    try {
      const result = await analyticsService.getLowStockSummary(
        req.user!.brandId,
      );
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to fetch low stock analytics",
      });
    }
  }

  async orderStatus(req: AuthRequest, res: Response) {
    try {
      const range = req.query.range as string | undefined;
      const result = await analyticsService.getOrderStatusSummary(
        req.user!.brandId,
        range,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to fetch order status analytics",
      });
    }
  }

  async inventoryTurnover(req: AuthRequest, res: Response) {
    try {
      const range = req.query.range as string | undefined;
      const result = await analyticsService.getInventoryTurnover(
        req.user!.brandId,
        range,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to fetch inventory turnover",
      });
    }
  }

  async conversionRate(req: AuthRequest, res: Response) {
    try {
      const range = req.query.range as string | undefined;
      const result = await analyticsService.getConversionRate(
        req.user!.brandId,
        range,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to fetch conversion rate",
      });
    }
  }
}
