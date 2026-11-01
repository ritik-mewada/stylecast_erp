import type { Inventory, Paginated, Product, ProductImage, ProductVariant } from "@/types/models"
import type { ProductInput, ProductQuery } from "../products"
import { getPaginated, http, text } from "./client"

type ApiVariant = Omit<ProductVariant, "size" | "color" | "material" | "inventory"> & {
  size: string | null
  color: string | null
  material: string | null
  inventory: Inventory | null
}
type ApiProduct = Omit<Product, "description" | "variants" | "images"> & {
  description: string | null
  variants: ApiVariant[]
  images: (Omit<ProductImage, "altText"> & { altText: string | null })[]
}

const toProduct = (product: ApiProduct): Product => ({
  ...product,
  description: text(product.description),
  variants: product.variants.map((variant) => ({
    ...variant,
    size: text(variant.size),
    color: text(variant.color),
    material: text(variant.material),
    // Every variant gets a stock row when it's created; this only guards old data.
    inventory: variant.inventory ?? {
      id: "",
      variantId: variant.id,
      quantity: 0,
      lowStockThreshold: 0,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    },
  })),
  images: [...product.images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => ({ ...image, altText: text(image.altText) })),
})

// Empty optional fields are left out rather than sent as "".
const optional = (value: string) => (value.trim() ? value : undefined)

const toBody = (input: ProductInput) => ({
  title: input.title,
  description: input.description,
  category: input.category,
  price: input.price,
  status: input.status,
  variants: input.variants.map((variant) => ({
    ...(variant.id && { id: variant.id }),
    sku: variant.sku,
    size: optional(variant.size),
    color: optional(variant.color),
    material: optional(variant.material),
    priceOverride: variant.priceOverride,
  })),
  images: input.images
    .filter((image) => image.imageUrl.trim())
    .map((image, index) => ({ imageUrl: image.imageUrl.trim(), altText: optional(image.altText), sortOrder: index })),
})

export async function listProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
  return getPaginated("/products", { ...query }, toProduct)
}

export async function getProduct(id: string): Promise<Product> {
  return toProduct((await http.get(`/products/${id}`)).data)
}

export async function createProduct(input: ProductInput): Promise<Product> {
  return toProduct((await http.post("/products", toBody(input))).data)
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  return toProduct((await http.put(`/products/${id}`, toBody(input))).data)
}

// Archives: the product and its stock records stay, and past orders still point at them.
export async function deleteProduct(id: string): Promise<void> {
  await http.delete(`/products/${id}`)
}
