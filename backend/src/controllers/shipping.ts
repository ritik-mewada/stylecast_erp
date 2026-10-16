import { Response, NextFunction } from "express";
import { ShippingService } from "../services/shipping";
import { AuthRequest } from "../middleware/auth";

const shippingService = new ShippingService();

export class ShippingController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rule = await shippingService.createRule(
        req.user!.brandId,
        req.body,
      );
      res.status(201).json(rule);
    } catch (err) {
      next(err);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rules = await shippingService.getRules(req.user!.brandId);
      res.status(200).json(rules);
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rule = await shippingService.updateRule(
        String(req.params.id),
        req.user!.brandId,
        req.body,
      );
      res.status(200).json(rule);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await shippingService.deleteRule(
        String(req.params.id),
        req.user!.brandId,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
