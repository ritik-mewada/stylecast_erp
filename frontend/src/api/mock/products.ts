import type { Paginated, Product, ProductImage, ProductVariant } from "@/types/models"
import { uid } from "@/mocks/seed"
import { currentBrandId, requirePermission } from "./auth"
import { ApiError, clone, db, delay, timestamp } from "./db"
import type { ImageInput, ProductInput, ProductQuery, VariantInput } from "../products"

// GET /products
export async function listProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
  await delay()
  const brandId = currentBrandId()
  const { page = 1, limit = 20, category, status, search } = query
  const term = search?.trim().toLowerCase()
  const rows = db.products.filter(
    (p) =>
      p.brandId === brandId &&
      (!category || p.category === category) &&
      (!status || p.status === status) &&
      (!term || p.title.toLowerCase().includes(term) || p.variants.some((v) => v.sku.toLowerCase().includes(term))),
  )
  return {
    data: clone(rows.slice((page - 1) * limit, page * limit)),
    total: rows.length,
    page,
    limit,
  }
}

const findProduct = (id: string) => {
  const product = db.products.find((p) => p.id === id && p.brandId === currentBrandId())
  if (!product) throw new ApiError(404, "Product not found")
  return product
}

// GET /products/:id
export async function getProduct(id: string): Promise<Product> {
  await delay()
  return clone(findProduct(id))
}

const buildVariant = (productId: string, input: VariantInput, existing?: ProductVariant): ProductVariant => {
  const now = timestamp()
  const id = existing?.id ?? uid()
  return {
    id,
    productId,
    sku: input.sku,
    size: input.size,
    color: input.color,
    material: input.material,
    priceOverride: input.priceOverride,
    // New variants start with zero stock, as the backend does; stock is set via /inventory.
    inventory: existing?.inventory ?? {
      id: uid(),
      variantId: id,
      quantity: 0,
      lowStockThreshold: 5,
      createdAt: now,
      updatedAt: now,
    },
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}

const buildImages = (productId: string, images: ImageInput[]): ProductImage[] =>
  images
    .filter((image) => image.imageUrl.trim())
    .map((image, index) => ({
      id: uid(),
      productId,
      imageUrl: image.imageUrl.trim(),
      altText: image.altText,
      sortOrder: index,
      createdAt: timestamp(),
    }))

const assertUniqueSkus = (variants: VariantInput[], productId?: string) => {
  const skus = new Set<string>()
  for (const v of variants) {
    if (skus.has(v.sku)) throw new ApiError(409, `Duplicate SKU ${v.sku}`)
    skus.add(v.sku)
    const clash = db.products.some((p) => p.id !== productId && p.variants.some((pv) => pv.sku === v.sku))
    if (clash) throw new ApiError(409, `SKU ${v.sku} is already in use`)
  }
}

// POST /products
export async function createProduct(input: ProductInput): Promise<Product> {
  await delay()
  requirePermission("editProducts")
  const brandId = currentBrandId()
  assertUniqueSkus(input.variants)
  const now = timestamp()
  const id = uid()
  const product: Product = {
    id,
    title: input.title,
    description: input.description,
    category: input.category,
    price: input.price,
    status: input.status,
    brandId,
    variants: input.variants.map((v) => buildVariant(id, v)),
    images: buildImages(id, input.images),
    createdAt: now,
    updatedAt: now,
  }
  db.products.unshift(product)
  return clone(product)
}

// PUT /products/:id
export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  await delay()
  requirePermission("editProducts")
  const product = findProduct(id)
  assertUniqueSkus(input.variants, id)
  Object.assign(product, {
    title: input.title,
    description: input.description,
    category: input.category,
    price: input.price,
    status: input.status,
    variants: input.variants.map((v) =>
      buildVariant(
        id,
        v,
        product.variants.find((pv) => pv.id === v.id),
      ),
    ),
    images: buildImages(id, input.images),
    updatedAt: timestamp(),
  })
  return clone(product)
}

// DELETE /products/:id archives: the product and its stock records stay, and past orders still point at them.
export async function deleteProduct(id: string): Promise<void> {
  await delay()
  requirePermission("editProducts")
  const product = findProduct(id)
  product.status = "archived"
  product.updatedAt = timestamp()
}
