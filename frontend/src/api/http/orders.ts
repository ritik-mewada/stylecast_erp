import type { Order, OrderItem, OrderStatus, Paginated } from "@/types/models"
import type { CreateOrderInput, OrderQuery } from "../orders"
import { getPaginated, http, text } from "./client"

type ApiOrderItem = Omit<OrderItem, "variant"> & {
  variant: { id: string; sku: string; size: string | null; color: string | null }
}
type ApiOrder = Omit<Order, "shippingStateOrProvince" | "items"> & {
  shippingStateOrProvince: string | null
  items: ApiOrderItem[]
}

const toOrder = (order: ApiOrder): Order => ({
  ...order,
  shippingStateOrProvince: text(order.shippingStateOrProvince),
  items: order.items.map((item) => ({
    ...item,
    product: { id: item.product.id, title: item.product.title },
    variant: {
      id: item.variant.id,
      sku: item.variant.sku,
      size: text(item.variant.size),
      color: text(item.variant.color),
    },
  })),
})

export async function listOrders(query: OrderQuery = {}): Promise<Paginated<Order>> {
  return getPaginated("/orders", { ...query }, toOrder)
}

export async function getOrder(id: string): Promise<Order> {
  return toOrder((await http.get(`/orders/${id}`)).data)
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { shippingStateOrProvince, ...rest } = input
  const body = { ...rest, ...(shippingStateOrProvince.trim() && { shippingStateOrProvince }) }
  return toOrder((await http.post("/orders", body)).data)
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return toOrder((await http.patch(`/orders/${id}/status`, { orderStatus: status })).data.order)
}

export async function refundOrder(id: string): Promise<Order> {
  return toOrder((await http.patch(`/orders/${id}/refund`)).data.order)
}
