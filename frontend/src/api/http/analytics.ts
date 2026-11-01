import type {
  AnalyticsOverview,
  AnalyticsRange,
  ConversionRate,
  InventoryTurnover,
  OrderStatusCount,
  SalesPoint,
  TopProduct,
} from "@/types/models"
import { http } from "./client"

const get = async <T>(path: string, params: Record<string, unknown>) => (await http.get<T>(path, { params })).data

export const getOverview = (range: AnalyticsRange) => get<AnalyticsOverview>("/analytics/overview", { range })

export const getTopProducts = (range: AnalyticsRange, limit = 5) =>
  get<TopProduct[]>("/analytics/top-products", { range, limit })

export const getOrderStatusSummary = (range: AnalyticsRange) =>
  get<OrderStatusCount[]>("/analytics/order-status", { range })

export const getInventoryTurnover = (range: AnalyticsRange) =>
  get<InventoryTurnover>("/analytics/inventory-turnover", { range })

export const getConversionRate = (range: AnalyticsRange) => get<ConversionRate>("/analytics/conversion-rate", { range })

export const getSalesSeries = (days = 30) => get<SalesPoint[]>("/analytics/sales-series", { days })
