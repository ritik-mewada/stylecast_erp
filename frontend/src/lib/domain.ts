import type { BrandApprovalStatus, OrderStatus, PaymentStatus, Product, ProductVariant, UserRole } from "@/types/models"

// Same table as validTransitions in the backend's order service.
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  refunded: [],
}

export const ORDER_FLOW: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered"]

// Mirrors processRefund(): anything not already refunded.
export const canRefund = (status: OrderStatus, payment: PaymentStatus) =>
  status !== "refunded" && payment !== "refunded"

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
}

export const APPROVAL_STATUS_LABEL: Record<BrandApprovalStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
}

export const ROLE_LABEL: Record<UserRole, string> = {
  platform_admin: "Platform admin",
  brand_owner: "Owner",
  brand_manager: "Manager",
  operations_manager: "Operations",
}

// Who may do what, matching authorizeRoles() on each backend route.
export const PERMISSIONS = {
  editProducts: ["brand_owner", "brand_manager"],
  editInventory: ["brand_owner", "brand_manager"],
  createOrders: ["brand_owner", "brand_manager", "operations_manager"],
  updateOrders: ["brand_owner", "operations_manager"],
  editShipping: ["brand_owner", "brand_manager"],
  deleteShipping: ["brand_owner"],
  viewTeam: ["brand_owner", "brand_manager"],
  manageUsers: ["brand_owner"],
  editBrand: ["brand_owner", "brand_manager"],
} satisfies Record<string, UserRole[]>

export type Permission = keyof typeof PERMISSIONS

export const can = (role: UserRole | undefined, permission: Permission) =>
  !!role && (PERMISSIONS[permission] as UserRole[]).includes(role)

export const variantPrice = (product: Pick<Product, "price">, variant: Pick<ProductVariant, "priceOverride">) =>
  variant.priceOverride ?? product.price

export const totalStock = (product: Product) => product.variants.reduce((sum, v) => sum + v.inventory.quantity, 0)

export const isLowStock = (variant: ProductVariant) => variant.inventory.quantity <= variant.inventory.lowStockThreshold

export const orderTotal = (items: { price: number; quantity: number }[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0)

export const SIZES = ["XS", "S", "M", "L", "XL"]

export const CATEGORIES = ["Dresses", "Tops", "Outerwear", "Denim", "Knitwear", "Accessories"]

// Swatch colours for product placeholders until real images exist.
export const COLOR_SWATCH: Record<string, string> = {
  Black: "#1f1d1b",
  Ivory: "#efe8db",
  Sand: "#d8c3a0",
  Camel: "#b88a56",
  Olive: "#6f7148",
  Navy: "#27324a",
  Rust: "#a4502e",
  Sage: "#a3ad92",
  Blush: "#e4b9ad",
  Charcoal: "#45423f",
  Indigo: "#38456b",
  Cream: "#f3ead6",
}
