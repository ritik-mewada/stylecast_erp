import type { ProductStatus } from "@/types/models"
import type * as Impl from "./http/products"
import { DEMO_MODE, lazyApi } from "./mode"

export interface ProductQuery {
  page?: number
  limit?: number
  category?: string
  status?: ProductStatus
  search?: string
}

export interface VariantInput {
  id?: string
  sku: string
  size: string
  color: string
  material: string
  priceOverride: number | null
}

export interface ImageInput {
  imageUrl: string
  altText: string
}

export interface ProductInput {
  title: string
  description: string
  category: string
  price: number
  status: ProductStatus
  variants: VariantInput[]
  images: ImageInput[]
}

const api = lazyApi((): Promise<typeof Impl> => (DEMO_MODE ? import("./mock/products") : import("./http/products")))

export const listProducts = api("listProducts")
export const getProduct = api("getProduct")
export const createProduct = api("createProduct")
export const updateProduct = api("updateProduct")
export const deleteProduct = api("deleteProduct")
