import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { OrderService } from "../services/order";
import { OrderStatus } from "../entity/Order";

const orderService = new OrderService();

export class OrderController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, status } = req.query;
      const result = await orderService.getOrders(
        req.user!.brandId,
        Number(page) || 1,
        Number(limit) || 20,
        status as OrderStatus | undefined,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await orderService.getOrderById(
        String(req.params.id),
        req.user!.brandId,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await orderService.updateOrderStatus(
        String(req.params.id),
        req.user!.brandId,
        req.body.orderStatus,
      );
      res.status(200).json({
        message: "Order status updated successfully",
        order: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async refund(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await orderService.processRefund(
        String(req.params.id),
        req.user!.brandId,
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
