import type { Inventory, LowStockItem } from "@/types/models"
import { getPaginated, http, text } from "./client"

interface InventoryRow {
  variantId: string
  sku: string
  size: string | null
  color: string | null
  productId: string
  productTitle: string
  quantity: number
  lowStockThreshold: number
}

// GET /inventory?status=low gives flat rows, lowest stock first, which is what
// the dashboard shows (GET /inventory/low-stock nests inventory → variant → product).
export async function listLowStock(): Promise<LowStockItem[]> {
  const page = await getPaginated<InventoryRow, LowStockItem>("/inventory", { status: "low", limit: 100 }, (row) => ({
    variantId: row.variantId,
    sku: row.sku,
    productId: row.productId,
    productTitle: row.productTitle,
    size: text(row.size),
    color: text(row.color),
    quantity: row.quantity,
    lowStockThreshold: row.lowStockThreshold,
  }))
  return page.data
}

export async function updateInventory(
  variantId: string,
  input: { quantity: number; lowStockThreshold?: number },
): Promise<Inventory> {
  return (await http.put(`/inventory/variant/${variantId}`, input)).data
}
