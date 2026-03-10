import { AppDataSource } from "../data-source";
import { Order, OrderStatus, PaymentStatus } from "../entity/Order";

export class OrderService {
  private orderRepository = AppDataSource.getRepository(Order);

  async getOrders(brandId: string, page = 1, limit = 20, status?: OrderStatus) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const query = this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.items", "items")
      .where("order.brandId = :brandId", { brandId })
      .orderBy("order.createdAt", "DESC")
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit);

    if (status) {
      query.andWhere("order.orderStatus = :status", { status });
    }

    const [orders, total] = await query.getManyAndCount();

    return {
      data: orders,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getOrderById(orderId: string, brandId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, brandId },
      relations: ["items"],
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    brandId: string,
    newStatus: OrderStatus,
  ) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, brandId },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    if (!validTransitions[order.orderStatus].includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${order.orderStatus} to ${newStatus}`,
      );
    }

    order.orderStatus = newStatus;
    await this.orderRepository.save(order);

    return order;
  }

  async processRefund(orderId: string, brandId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, brandId },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (
      order.orderStatus === OrderStatus.REFUNDED ||
      order.paymentStatus === PaymentStatus.REFUNDED
    ) {
      throw new Error("Order already refunded");
    }

    order.orderStatus = OrderStatus.REFUNDED;
    order.paymentStatus = PaymentStatus.REFUNDED;

    await this.orderRepository.save(order);

    return {
      message: "Refund processed successfully",
      order,
    };
  }
}
