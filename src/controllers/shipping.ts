// Takes care of shipping rule management. Brands can create rules for different
// regions (name, fee, free shipping threshold, and delivery estimate), list all
// their rules, update them, or delete ones they no longer need.

import { Response } from "express";
import { ShippingService } from "../services/shipping";
import { AuthRequest } from "../middleware/auth";

const shippingService = new ShippingService();

export class ShippingController {
  async create(req: AuthRequest, res: Response) {
    try {
      const rule = await shippingService.createRule(
        req.user!.brandId,
        req.body,
      );

      res.status(201).json(rule);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async list(req: AuthRequest, res: Response) {
    try {
      const rules = await shippingService.getRules(req.user!.brandId);

      res.json(rules);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const rule = await shippingService.updateRule(
        String(req.params.id),
        req.user!.brandId,
        req.body,
      );

      res.json(rule);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const result = await shippingService.deleteRule(
        String(req.params.id),
        req.user!.brandId,
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
