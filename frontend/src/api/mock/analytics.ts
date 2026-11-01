import type {
  AnalyticsOverview,
  AnalyticsRange,
  ConversionRate,
  InventoryTurnover,
  OrderStatus,
  OrderStatusCount,
  SalesPoint,
  TopProduct,
} from "@/types/models"
import { orderTotal } from "@/lib/domain"
import { currentBrandId } from "./auth"
import { db, delay } from "./db"

// Matches getRangeStartDate() in the backend: daily = 1 day, weekly = 7, monthly = 30.
const RANGE_DAYS: Record<AnalyticsRange, number | null> = { daily: 1, weekly: 7, monthly: 30, all_time: null }

const ordersInRange = (range: AnalyticsRange) => {
  const brandId = currentBrandId()
  const days = RANGE_DAYS[range]
  const since = days ? Date.now() - days * 86400000 : 0
  return db.orders.filter((o) => o.brandId === brandId && new Date(o.createdAt).getTime() >= since)
}

const counted = (status: OrderStatus) => status !== "cancelled"

// GET /analytics/overview
export async function getOverview(range: AnalyticsRange): Promise<AnalyticsOverview> {
  await delay()
  const brandId = currentBrandId()
  const orders = ordersInRange(range)
  const products = db.products.filter((p) => p.brandId === brandId)
  return {
    range,
    totalOrders: orders.length,
    totalProducts: products.length,
    totalActiveProducts: products.filter((p) => p.status === "active").length,
    totalSales: orders.filter((o) => counted(o.orderStatus)).reduce((sum, o) => sum + orderTotal(o.items), 0),
  }
}

// GET /analytics/top-products
export async function getTopProducts(range: AnalyticsRange, limit = 5): Promise<TopProduct[]> {
  await delay()
  const totals = new Map<string, TopProduct>()
  for (const order of ordersInRange(range).filter((o) => counted(o.orderStatus))) {
    for (const item of order.items) {
      const row = totals.get(item.productId) ?? {
        productId: item.productId,
        title: item.product.title,
        unitsSold: 0,
        revenue: 0,
      }
      row.unitsSold += item.quantity
      row.revenue += item.price * item.quantity
      totals.set(item.productId, row)
    }
  }
  return [...totals.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit)
}

// GET /analytics/order-status
export async function getOrderStatusSummary(range: AnalyticsRange): Promise<OrderStatusCount[]> {
  await delay()
  const counts = new Map<OrderStatus, number>()
  for (const order of ordersInRange(range)) counts.set(order.orderStatus, (counts.get(order.orderStatus) ?? 0) + 1)
  return [...counts.entries()].map(([status, count]) => ({ status, count }))
}

// GET /analytics/inventory-turnover
export async function getInventoryTurnover(range: AnalyticsRange): Promise<InventoryTurnover> {
  await delay()
  const brandId = currentBrandId()
  const unitsSold = ordersInRange(range)
    .filter((o) => counted(o.orderStatus))
    .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)
  const currentInventoryUnits = db.products
    .filter((p) => p.brandId === brandId)
    .reduce((sum, p) => sum + p.variants.reduce((s, v) => s + v.inventory.quantity, 0), 0)
  return {
    range,
    unitsSold,
    currentInventoryUnits,
    turnoverRate: currentInventoryUnits ? Number((unitsSold / currentInventoryUnits).toFixed(2)) : 0,
    note: "Inventory turnover is approximated as units sold divided by current inventory units for the selected period.",
  }
}

// GET /analytics/conversion-rate
export async function getConversionRate(range: AnalyticsRange): Promise<ConversionRate> {
  await delay()
  const days = RANGE_DAYS[range] ?? db.sessions.length
  const sessions = db.sessions.slice(-days).reduce((a, b) => a + b, 0)
  const ordersPlaced = ordersInRange(range).length
  return {
    range,
    sessions,
    ordersPlaced,
    conversionRate: sessions ? Number(((ordersPlaced / sessions) * 100).toFixed(2)) : 0,
    unit: "%",
    note: "Conversion rate is based on marketplace traffic data synced into traffic_metrics.",
  }
}

// Not in the API yet: needed for the revenue chart. Proposed GET /analytics/sales-series.
export async function getSalesSeries(days = 30): Promise<SalesPoint[]> {
  await delay()
  const brandId = currentBrandId()
  const points: SalesPoint[] = Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (days - 1 - i))
    return { date: d.toISOString(), revenue: 0, orders: 0 }
  })
  const start = new Date(points[0].date).getTime()
  for (const order of db.orders) {
    if (order.brandId !== brandId || !counted(order.orderStatus)) continue
    const index = Math.floor((new Date(order.createdAt).getTime() - start) / 86400000)
    if (index < 0 || index >= days) continue
    points[index].revenue += orderTotal(order.items)
    points[index].orders += 1
  }
  return points
}
