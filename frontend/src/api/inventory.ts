import type { Inventory, LowStockItem } from "@/types/models"
import { currentBrandId, requirePermission } from "./auth"
import { ApiError, clone, db, delay, timestamp } from "./mock-db"

const brandVariants = () => {
  const brandId = currentBrandId()
  return db.products
    .filter((p) => p.brandId === brandId)
    .flatMap((product) => product.variants.map((variant) => ({ product, variant })))
}

// GET /inventory/low-stock
export async function listLowStock(): Promise<LowStockItem[]> {
  await delay()
  return brandVariants()
    .filter(
      ({ product, variant }) =>
        product.status === "active" && variant.inventory.quantity <= variant.inventory.lowStockThreshold,
    )
    .map(({ product, variant }) => ({
      variantId: variant.id,
      sku: variant.sku,
      productId: product.id,
      productTitle: product.title,
      size: variant.size,
      color: variant.color,
      quantity: variant.inventory.quantity,
      lowStockThreshold: variant.inventory.lowStockThreshold,
    }))
    .sort((a, b) => a.quantity - b.quantity)
}

// PUT /inventory/variant/:variantId
export async function updateInventory(
  variantId: string,
  input: { quantity: number; lowStockThreshold?: number },
): Promise<Inventory> {
  await delay(200)
  requirePermission("editInventory")
  const row = brandVariants().find(({ variant }) => variant.id === variantId)
  if (!row) throw new ApiError(404, "Variant not found")
  if (input.quantity < 0) throw new ApiError(400, "Quantity cannot be negative")
  Object.assign(row.variant.inventory, input, { updatedAt: timestamp() })
  return clone(row.variant.inventory)
}
