// Manages order-related endpoints. Covers listing orders (with pagination and
// status filtering), getting a single order, moving an order through its status
// lifecycle, and processing refunds. All scoped to the authenticated brand.

import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { OrderService } from "../services/order";
import { OrderStatus } from "../entity/Order";

const orderService = new OrderService();

export class OrderController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const { page, limit, status } = req.query;

      const result = await orderService.getOrders(
        req.user!.brandId,
        Number(page) || 1,
        Number(limit) || 20,
        status as OrderStatus | undefined,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to fetch orders",
      });
    }
  }

  async getOne(req: AuthRequest, res: Response) {
    try {
      const result = await orderService.getOrderById(
        String(req.params.id),
        req.user!.brandId,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(404).json({
        message: error.message || "Failed to fetch order",
      });
    }
  }

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const result = await orderService.updateOrderStatus(
        String(req.params.id),
        req.user!.brandId,
        req.body.orderStatus,
      );

      return res.status(200).json({
        message: "Order status updated successfully",
        order: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to update order status",
      });
    }
  }

  async refund(req: AuthRequest, res: Response) {
    try {
      const result = await orderService.processRefund(
        String(req.params.id),
        req.user!.brandId,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Failed to process refund",
      });
    }
  }
}
