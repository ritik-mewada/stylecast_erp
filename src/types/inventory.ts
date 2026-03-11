// Simple type for inventory updates. Both fields are optional — you might
// just want to update the stock count, the low stock threshold, or both.

export interface UpdateInventoryInput {
  quantity?: number;
  lowStockThreshold?: number;
}
