// The analytics service does all the heavy number crunching for the dashboard.
// It queries orders, inventory, products, and traffic metrics to produce things
// like sales overviews, top products, low stock alerts, and conversion rates.
// Most methods support an optional date range (daily, weekly, monthly).

import { AppDataSource } from "../data-source";
import { Order, OrderStatus } from "../entity/Order";
import { OrderItem } from "../entity/OrderItem";
import { Product, ProductStatus } from "../entity/Product";
import { Inventory } from "../entity/Inventory";
import { TrafficMetric } from "../entity/TrafficMatric";
import { getRangeStartDate } from "../utils/analytics-range";

export class AnalyticsService {
  private orderRepo = AppDataSource.getRepository(Order);
  private orderItemRepo = AppDataSource.getRepository(OrderItem);
  private productRepo = AppDataSource.getRepository(Product);
  private inventoryRepo = AppDataSource.getRepository(Inventory);
  private trafficMetricRepo = AppDataSource.getRepository(TrafficMetric);

  async getOverview(brandId: string, range?: string) {
    const startDate = getRangeStartDate(range);

    const orderQuery = this.orderRepo
      .createQueryBuilder("order")
      .where("order.brandId = :brandId", { brandId });

    if (startDate) {
      orderQuery.andWhere("order.createdAt >= :startDate", { startDate });
    }

    const totalOrders = await orderQuery.getCount();

    const totalProducts = await this.productRepo.count({
      where: { brandId },
    });

    const totalActiveProducts = await this.productRepo.count({
      where: {
        brandId,
        status: ProductStatus.ACTIVE,
      },
    });

    const salesQuery = this.orderItemRepo
      .createQueryBuilder("order_item")
      .leftJoin("order_item.order", "order")
      .select(
        "COALESCE(SUM(order_item.price * order_item.quantity), 0)",
        "total_sales",
      )
      .where("order.brandId = :brandId", { brandId })
      .andWhere("order.orderStatus != :cancelled", {
        cancelled: OrderStatus.CANCELLED,
      });

    if (startDate) {
      salesQuery.andWhere("order.createdAt >= :startDate", { startDate });
    }

    const salesResult = await salesQuery.getRawOne();

    return {
      range: range || "all_time",
      totalOrders,
      totalProducts,
      totalActiveProducts,
      totalSales: Number(salesResult?.total_sales || 0),
    };
  }

  async getTopProducts(brandId: string, limit = 5, range?: string) {
    const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 20);
    const startDate = getRangeStartDate(range);

    const query = this.orderItemRepo
      .createQueryBuilder("order_item")
      .leftJoin("order_item.order", "order")
      .leftJoin("order_item.product", "product")
      .select("product.id", "product_id")
      .addSelect("product.title", "title")
      .addSelect("SUM(order_item.quantity)", "units_sold")
      .addSelect("SUM(order_item.price * order_item.quantity)", "revenue")
      .where("order.brandId = :brandId", { brandId })
      .andWhere("order.orderStatus != :cancelled", {
        cancelled: OrderStatus.CANCELLED,
      });

    if (startDate) {
      query.andWhere("order.createdAt >= :startDate", { startDate });
    }

    const result = await query
      .groupBy("product.id")
      .addGroupBy("product.title")
      .orderBy("units_sold", "DESC")
      .limit(safeLimit)
      .getRawMany();

    return result.map((row) => ({
      productId: row.product_id,
      title: row.title,
      unitsSold: Number(row.units_sold || 0),
      revenue: Number(row.revenue || 0),
    }));
  }

  async getLowStockSummary(brandId: string) {
    const items = await this.inventoryRepo
      .createQueryBuilder("inventory")
      .leftJoinAndSelect("inventory.variant", "variant")
      .leftJoinAndSelect("variant.product", "product")
      .where("product.brandId = :brandId", { brandId })
      .andWhere("inventory.quantity <= inventory.lowStockThreshold")
      .orderBy("inventory.quantity", "ASC")
      .getMany();

    return {
      count: items.length,
      items,
    };
  }

  async getOrderStatusSummary(brandId: string, range?: string) {
    const startDate = getRangeStartDate(range);

    const query = this.orderRepo
      .createQueryBuilder("order")
      .select("order.orderStatus", "status")
      .addSelect("COUNT(order.id)", "count")
      .where("order.brandId = :brandId", { brandId });

    if (startDate) {
      query.andWhere("order.createdAt >= :startDate", { startDate });
    }

    const result = await query.groupBy("order.orderStatus").getRawMany();

    return result.map((row) => ({
      status: row.status,
      count: Number(row.count || 0),
    }));
  }

  async getInventoryTurnover(brandId: string, range?: string) {
    const startDate = getRangeStartDate(range);

    const soldQuery = this.orderItemRepo
      .createQueryBuilder("order_item")
      .leftJoin("order_item.order", "order")
      .leftJoin("order_item.variant", "variant")
      .leftJoin("variant.product", "product")
      .select("COALESCE(SUM(order_item.quantity), 0)", "units_sold")
      .where("order.brandId = :brandId", { brandId })
      .andWhere("order.orderStatus != :cancelled", {
        cancelled: OrderStatus.CANCELLED,
      });

    if (startDate) {
      soldQuery.andWhere("order.createdAt >= :startDate", { startDate });
    }

    const soldResult = await soldQuery.getRawOne();

    const inventoryResult = await this.inventoryRepo
      .createQueryBuilder("inventory")
      .leftJoin("inventory.variant", "variant")
      .leftJoin("variant.product", "product")
      .select("COALESCE(SUM(inventory.quantity), 0)", "current_inventory_units")
      .where("product.brandId = :brandId", { brandId })
      .getRawOne();

    const unitsSold = Number(soldResult?.units_sold || 0);
    const currentInventoryUnits = Number(
      inventoryResult?.current_inventory_units || 0,
    );

    const turnoverRate =
      currentInventoryUnits > 0 ? unitsSold / currentInventoryUnits : 0;

    return {
      range: range || "all_time",
      unitsSold,
      currentInventoryUnits,
      turnoverRate: Number(turnoverRate.toFixed(2)),
      note: "Inventory turnover is approximated as units sold divided by current inventory units for the selected period.",
    };
  }

  async getConversionRate(brandId: string, range?: string) {
    const startDate = getRangeStartDate(range);

    const query = this.trafficMetricRepo
      .createQueryBuilder("traffic")
      .select("COALESCE(SUM(traffic.sessions), 0)", "sessions")
      .addSelect("COALESCE(SUM(traffic.ordersPlaced), 0)", "orders_placed")
      .where("traffic.brandId = :brandId", { brandId });

    if (startDate) {
      query.andWhere("traffic.metricDate >= :startDate", {
        startDate: startDate.toISOString().slice(0, 10),
      });
    }

    const result = await query.getRawOne();

    const sessions = Number(result?.sessions || 0);
    const ordersPlaced = Number(result?.orders_placed || 0);
    const conversionRate =
      sessions > 0 ? Number(((ordersPlaced / sessions) * 100).toFixed(2)) : 0;

    return {
      range: range || "all_time",
      sessions,
      ordersPlaced,
      conversionRate,
      unit: "%",
      note: "Conversion rate is based on marketplace traffic data synced into traffic_metrics.",
    };
  }
}
