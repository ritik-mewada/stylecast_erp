// Mirrors the backend TypeORM entities (stylecast_erp_backend/src/entity).
// Dates arrive from the API as ISO strings.

export type UserRole = "platform_admin" | "brand_owner" | "brand_manager" | "operations_manager"

export type BrandRole = Exclude<UserRole, "platform_admin">

export type BrandApprovalStatus = "pending" | "approved" | "rejected"
export type ProductStatus = "active" | "archived"
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export type AnalyticsRange = "daily" | "weekly" | "monthly" | "all_time"

export interface Brand {
  id: string
  name: string
  slug: string
  companyInfo: string
  website: string
  shippingOrigin: string
  brandCategory: string
  contactEmail: string
  contactPhone: string
  approvalStatus: BrandApprovalStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  brandId: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: string
  productId: string
  imageUrl: string
  altText: string
  sortOrder: number
  createdAt: string
}

export interface Inventory {
  id: string
  variantId: string
  quantity: number
  lowStockThreshold: number
  createdAt: string
  updatedAt: string
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  size: string
  color: string
  material: string
  priceOverride: number | null
  inventory: Inventory
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  title: string
  description: string
  category: string
  price: number
  status: ProductStatus
  brandId: string
  variants: ProductVariant[]
  images: ProductImage[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variantId: string
  quantity: number
  price: number
  product: Pick<Product, "id" | "title">
  variant: Pick<ProductVariant, "id" | "sku" | "size" | "color">
  createdAt: string
}

export interface Order {
  id: string
  brandId: string
  customerName: string
  customerEmail: string
  shippingCountry: string
  shippingCity: string
  shippingPostalCode: string
  shippingStateOrProvince: string
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface ShippingRule {
  id: string
  brandId: string
  regionName: string
  shippingFee: number
  freeShippingThreshold: number
  deliveryEstimate: string
  createdAt: string
  updatedAt: string
}

// Analytics responses (src/services/analytics.ts)

export interface AnalyticsOverview {
  range: AnalyticsRange
  totalOrders: number
  totalProducts: number
  totalActiveProducts: number
  totalSales: number
}

export interface TopProduct {
  productId: string
  title: string
  unitsSold: number
  revenue: number
}

export interface OrderStatusCount {
  status: OrderStatus
  count: number
}

export interface InventoryTurnover {
  range: AnalyticsRange
  unitsSold: number
  currentInventoryUnits: number
  turnoverRate: number
  note: string
}

export interface ConversionRate {
  range: AnalyticsRange
  sessions: number
  ordersPlaced: number
  conversionRate: number
  unit: "%"
  note: string
}

// Not in the API yet: daily revenue series for the dashboard chart.
export interface SalesPoint {
  date: string
  revenue: number
  orders: number
}

export interface LowStockItem {
  variantId: string
  sku: string
  productId: string
  productTitle: string
  size: string
  color: string
  quantity: number
  lowStockThreshold: number
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
}
