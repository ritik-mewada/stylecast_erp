import type * as Impl from "./http/analytics"
import { DEMO_MODE, lazyApi } from "./mode"

const api = lazyApi((): Promise<typeof Impl> => (DEMO_MODE ? import("./mock/analytics") : import("./http/analytics")))

export const getOverview = api("getOverview")
export const getTopProducts = api("getTopProducts")
export const getOrderStatusSummary = api("getOrderStatusSummary")
export const getInventoryTurnover = api("getInventoryTurnover")
export const getConversionRate = api("getConversionRate")
export const getSalesSeries = api("getSalesSeries")
