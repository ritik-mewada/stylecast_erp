// Types for inventory inputs. Updates have two optional fields — you might
// just want to update the stock count, the low stock threshold, or both.
// The list filters back GET /inventory.

export interface UpdateInventoryInput {
  quantity?: number;
  lowStockThreshold?: number;
}

export interface InventoryListFilters {
  status?: "low" | "out";
  search?: string;
}
