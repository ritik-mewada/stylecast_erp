import type { OrderStatus, PaymentStatus } from "@/types/models"
import type * as Impl from "./http/orders"
import { DEMO_MODE, lazyApi } from "./mode"

export interface OrderQuery {
  page?: number
  limit?: number
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  search?: string
}

export interface CreateOrderInput {
  customerName: string
  customerEmail: string
  shippingCountry: string
  shippingCity: string
  shippingPostalCode: string
  shippingStateOrProvince: string
  items: { variantId: string; quantity: number }[]
}

const api = lazyApi((): Promise<typeof Impl> => (DEMO_MODE ? import("./mock/orders") : import("./http/orders")))

export const listOrders = api("listOrders")
export const getOrder = api("getOrder")
export const createOrder = api("createOrder")
export const updateOrderStatus = api("updateOrderStatus")
export const refundOrder = api("refundOrder")
