import { seedBrands, seedOrders, seedProducts, seedSessions, seedShippingRules, seedUsers } from "@/mocks/seed"

// In-memory stand-in for the backend database. Resets on page reload.
const products = seedProducts()

export const db = {
  brands: seedBrands(),
  users: seedUsers(),
  products,
  orders: seedOrders(products),
  shippingRules: seedShippingRules(),
  sessions: seedSessions(30),
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export const delay = (ms = 250 + Math.random() * 250) => new Promise((resolve) => setTimeout(resolve, ms))

export const clone = <T>(value: T): T => structuredClone(value)

export const timestamp = () => new Date().toISOString()
