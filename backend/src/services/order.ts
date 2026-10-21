// Orders: listing, creation with stock reservation, the status state machine,
// and refunds. Anything that changes stock runs in a transaction and locks the
// affected inventory rows (SELECT ... FOR UPDATE), always in variantId order,
// so concurrent orders can't oversell and can't deadlock each other.

import { Brackets, EntityManager } from "typeorm";
import { AppDataSource } from "../data-source";
import { Brand, BrandApprovalStatus } from "../entity/Brand";
import { Inventory } from "../entity/Inventory";
import { Order, OrderStatus, PaymentStatus } from "../entity/Order";
import { OrderItem } from "../entity/OrderItem";
import { ProductStatus } from "../entity/Product";
import { ProductVariant } from "../entity/ProductVariant";
import { CreateOrderInput, OrderListFilters } from "../types/order";
import { AppError } from "../utils/AppError";
import { escapeLike, likePattern, paginated, parsePagination } from "../utils/pagination";

// Next statuses allowed by PATCH /orders/:id/status. Refunds have their own
// endpoint and are allowed from any status except refunded.
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

// Sums quantities per variant, keeping the order in which variants first appear.
const sumByVariant = (lines: { variantId: string; quantity: number }[]) => {
  const totals = new Map<string, number>();
  for (const line of lines) {
    totals.set(line.variantId, (totals.get(line.variantId) ?? 0) + line.quantity);
  }
  return totals;
};

export class OrderService {
  private orderRepository = AppDataSource.getRepository(Order);

  async getOrders(
    brandId: string,
    page: unknown,
    limit: unknown,
    filters: OrderListFilters = {},
  ) {
    const p = parsePagination(page, limit);

    const query = this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.product", "product")
      .leftJoinAndSelect("items.variant", "variant")
      .where("order.brandId = :brandId", { brandId })
      .orderBy("order.createdAt", "DESC")
      .skip(p.skip)
      .take(p.limit);

    if (filters.status) {
      query.andWhere("order.orderStatus = :status", { status: filters.status });
    }

    if (filters.paymentStatus) {
      query.andWhere("order.paymentStatus = :paymentStatus", {
        paymentStatus: filters.paymentStatus,
      });
    }

    // Customer name or email (contains), or the start of the order id, so
    // "#3f9a" finds the order shown as #3F9A… in the dashboard.
    if (filters.search) {
      const term = filters.search.replace(/^#/, "");
      query.andWhere(
        new Brackets((qb) =>
          qb
            .where("order.customerName ILIKE :contains")
            .orWhere("order.customerEmail ILIKE :contains")
            .orWhere("CAST(order.id AS text) ILIKE :prefix"),
        ),
        { contains: likePattern(term), prefix: `${escapeLike(term)}%` },
      );
    }

    const [orders, total] = await query.getManyAndCount();

    return paginated(orders, total, p.page, p.limit);
  }

  async getOrderById(orderId: string, brandId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, brandId },
      relations: ["items", "items.product", "items.variant"],
    });

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    return order;
  }

  // Creates an order and takes its stock in one transaction. Only approved
  // brands can take orders. Each line stores the price at the time of the
  // order: the variant's override if it has one, else the product price.
  async createOrder(brandId: string, input: CreateOrderInput) {
    const orderId = await AppDataSource.transaction(async (m) => {
      const brand = await m.findOne(Brand, { where: { id: brandId } });
      if (!brand) {
        throw new AppError(404, "Brand not found");
      }
      if (brand.approvalStatus !== BrandApprovalStatus.APPROVED) {
        throw new AppError(403, "Brand must be approved before taking orders");
      }

      const quantities = sumByVariant(input.items);
      const variantIds = [...quantities.keys()];

      const variants = await m
        .getRepository(ProductVariant)
        .createQueryBuilder("variant")
        .innerJoinAndSelect("variant.product", "product")
        .where("variant.id IN (:...variantIds)", { variantIds })
        .andWhere("product.brandId = :brandId", { brandId })
        .getMany();
      const variantsById = new Map(variants.map((v) => [v.id, v]));

      const missing = variantIds.filter((id) => !variantsById.has(id));
      if (missing.length > 0) {
        throw new AppError(404, "One or more variants were not found", {
          variantIds: missing,
        });
      }

      const archived = variants.filter(
        (v) => v.product.status === ProductStatus.ARCHIVED,
      );
      if (archived.length > 0) {
        throw new AppError(422, "Archived products can't be ordered", {
          skus: archived.map((v) => v.sku),
        });
      }

      const stock = await this.lockInventory(m, variantIds);

      const shortages = variantIds.flatMap((id) => {
        const requested = quantities.get(id)!;
        const available = stock.get(id)?.quantity ?? 0;
        return available < requested
          ? [{ sku: variantsById.get(id)!.sku, requested, available }]
          : [];
      });
      if (shortages.length > 0) {
        throw new AppError(409, "Insufficient stock", { items: shortages });
      }

      for (const id of variantIds) {
        await m.decrement(Inventory, { variantId: id }, "quantity", quantities.get(id)!);
      }

      const order = await m.save(
        m.create(Order, {
          brandId,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          shippingCountry: input.shippingCountry,
          shippingCity: input.shippingCity,
          shippingPostalCode: input.shippingPostalCode,
          shippingAddressLine1: input.shippingAddressLine1,
          shippingAddressLine2: input.shippingAddressLine2,
          shippingStateOrProvince: input.shippingStateOrProvince,
        }),
      );

      await m.save(
        variantIds.map((id) => {
          const variant = variantsById.get(id)!;
          return m.create(OrderItem, {
            orderId: order.id,
            productId: variant.productId,
            variantId: id,
            quantity: quantities.get(id)!,
            price: variant.priceOverride ?? variant.product.price,
          });
        }),
      );

      return order.id;
    });

    return this.getOrderById(orderId, brandId);
  }

  async updateOrderStatus(
    orderId: string,
    brandId: string,
    newStatus: OrderStatus,
  ) {
    await AppDataSource.transaction(async (m) => {
      const order = await this.lockOrder(m, orderId, brandId);

      if (!VALID_TRANSITIONS[order.orderStatus].includes(newStatus)) {
        throw new AppError(
          422,
          `Invalid status transition: ${order.orderStatus} → ${newStatus}`,
        );
      }

      if (newStatus === OrderStatus.CANCELLED) {
        await this.restock(m, order.id);
      }

      order.orderStatus = newStatus;
      await m.save(order);
    });

    return this.getOrderById(orderId, brandId);
  }

  // Refunds put the stock back (the goods are assumed to be returned), unless
  // the order was cancelled first: cancelling already restocked it.
  async processRefund(orderId: string, brandId: string) {
    await AppDataSource.transaction(async (m) => {
      const order = await this.lockOrder(m, orderId, brandId);

      if (
        order.orderStatus === OrderStatus.REFUNDED ||
        order.paymentStatus === PaymentStatus.REFUNDED
      ) {
        throw new AppError(409, "This order has already been refunded");
      }

      if (order.orderStatus !== OrderStatus.CANCELLED) {
        await this.restock(m, order.id);
      }

      order.orderStatus = OrderStatus.REFUNDED;
      order.paymentStatus = PaymentStatus.REFUNDED;
      await m.save(order);
    });

    return {
      message: "Refund processed successfully",
      order: await this.getOrderById(orderId, brandId),
    };
  }

  // Locks the order row so concurrent status changes and refunds on the same
  // order run one after the other (and stock is only returned once).
  private async lockOrder(m: EntityManager, orderId: string, brandId: string) {
    const order = await m.findOne(Order, {
      where: { id: orderId, brandId },
      lock: { mode: "pessimistic_write" },
    });

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    return order;
  }

  // Locks the inventory rows for these variants, sorted by variantId so every
  // transaction takes its locks in the same order.
  private async lockInventory(m: EntityManager, variantIds: string[]) {
    const rows = await m
      .getRepository(Inventory)
      .createQueryBuilder("inventory")
      .setLock("pessimistic_write")
      .where("inventory.variantId IN (:...variantIds)", { variantIds })
      .orderBy("inventory.variantId", "ASC")
      .getMany();

    return new Map(rows.map((row) => [row.variantId, row]));
  }

  private async restock(m: EntityManager, orderId: string) {
    const items = await m.find(OrderItem, { where: { orderId } });
    const quantities = sumByVariant(items);
    const variantIds = [...quantities.keys()];

    if (variantIds.length === 0) {
      return;
    }

    await this.lockInventory(m, variantIds);

    for (const id of variantIds) {
      await m.increment(Inventory, { variantId: id }, "quantity", quantities.get(id)!);
    }
  }
}
