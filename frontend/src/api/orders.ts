import type { Order, OrderStatus, Paginated, PaymentStatus } from "@/types/models"
import { ORDER_TRANSITIONS } from "@/lib/domain"
import { uid } from "@/mocks/seed"
import { currentBrandId, requirePermission } from "./auth"
import { ApiError, clone, db, delay, timestamp } from "./mock-db"

export interface OrderQuery {
  page?: number
  limit?: number
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  search?: string
}

// GET /orders
export async function listOrders(query: OrderQuery = {}): Promise<Paginated<Order>> {
  await delay()
  const brandId = currentBrandId()
  const { page = 1, limit = 20, status, paymentStatus, search } = query
  const term = search?.trim().toLowerCase()
  const rows = db.orders.filter(
    (o) =>
      o.brandId === brandId &&
      (!status || o.orderStatus === status) &&
      (!paymentStatus || o.paymentStatus === paymentStatus) &&
      (!term ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerEmail.toLowerCase().includes(term) ||
        o.id.toLowerCase().startsWith(term.replace("#", ""))),
  )
  return { data: clone(rows.slice((page - 1) * limit, page * limit)), total: rows.length, page, limit }
}

const findOrder = (id: string) => {
  const order = db.orders.find((o) => o.id === id && o.brandId === currentBrandId())
  if (!order) throw new ApiError(404, "Order not found")
  return order
}

// GET /orders/:id
export async function getOrder(id: string): Promise<Order> {
  await delay()
  return clone(findOrder(id))
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

const findVariant = (variantId: string, brandId: string) => {
  for (const product of db.products) {
    if (product.brandId !== brandId) continue
    const variant = product.variants.find((v) => v.id === variantId)
    if (variant) return { product, variant }
  }
  throw new ApiError(404, "Variant not found")
}

const restock = (order: Order) => {
  for (const item of order.items) {
    const { variant } = findVariant(item.variantId, order.brandId)
    variant.inventory.quantity += item.quantity
  }
}

// POST /orders (Step 1): approved brands only, stock is checked and decremented.
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  await delay()
  requirePermission("createOrders")
  const brandId = currentBrandId()
  const brand = db.brands.find((b) => b.id === brandId)
  if (brand?.approvalStatus !== "approved") {
    throw new ApiError(403, "Your brand must be approved before it can take orders")
  }
  const lines = input.items.map((item) => ({ ...findVariant(item.variantId, brandId), quantity: item.quantity }))
  for (const { product, variant, quantity } of lines) {
    if (variant.inventory.quantity < quantity) {
      throw new ApiError(
        409,
        `Only ${variant.inventory.quantity} left of ${product.title} (${variant.color}, ${variant.size})`,
      )
    }
  }
  const now = timestamp()
  const id = uid()
  const order: Order = {
    id,
    brandId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    shippingCountry: input.shippingCountry,
    shippingCity: input.shippingCity,
    shippingPostalCode: input.shippingPostalCode,
    shippingStateOrProvince: input.shippingStateOrProvince,
    paymentStatus: "pending",
    orderStatus: "pending",
    items: lines.map(({ product, variant, quantity }) => {
      variant.inventory.quantity -= quantity
      return {
        id: uid(),
        orderId: id,
        productId: product.id,
        variantId: variant.id,
        quantity,
        price: variant.priceOverride ?? product.price,
        product: { id: product.id, title: product.title },
        variant: { id: variant.id, sku: variant.sku, size: variant.size, color: variant.color },
        createdAt: now,
      }
    }),
    createdAt: now,
    updatedAt: now,
  }
  db.orders.unshift(order)
  return clone(order)
}

// PATCH /orders/:id/status
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  await delay()
  requirePermission("updateOrders")
  const order = findOrder(id)
  if (!ORDER_TRANSITIONS[order.orderStatus].includes(status)) {
    throw new ApiError(422, `Invalid status transition: ${order.orderStatus} → ${status}`)
  }
  if (status === "cancelled") restock(order)
  order.orderStatus = status
  order.updatedAt = timestamp()
  return clone(order)
}

// PATCH /orders/:id/refund — restocks unless the order was already cancelled.
export async function refundOrder(id: string): Promise<Order> {
  await delay()
  requirePermission("updateOrders")
  const order = findOrder(id)
  if (order.orderStatus === "refunded" || order.paymentStatus === "refunded") {
    throw new ApiError(409, "This order has already been refunded")
  }
  if (order.orderStatus !== "cancelled") restock(order)
  order.orderStatus = "refunded"
  order.paymentStatus = "refunded"
  order.updatedAt = timestamp()
  return clone(order)
}
