// Handles stock level management for product variants. The update method works
// as an upsert — it creates an inventory record if one doesn't exist yet, or
// updates the existing one. Also handles fetching the low stock alert list.

import { AppDataSource } from "../data-source";
import { Inventory } from "../entity/Inventory";
import { ProductVariant } from "../entity/ProductVariant";
import { UpdateInventoryInput } from "../types/inventory";

export class InventoryService {
  private inventoryRepo = AppDataSource.getRepository(Inventory);
  private variantRepo = AppDataSource.getRepository(ProductVariant);

  async getInventoryByVariant(variantId: string) {
    const inventory = await this.inventoryRepo.findOne({
      where: { variantId },
    });

    if (!inventory) {
      throw new Error("Inventory not found for this variant");
    }

    return inventory;
  }

  async updateInventory(variantId: string, data: UpdateInventoryInput) {
    let inventory = await this.inventoryRepo.findOne({
      where: { variantId },
    });

    if (!inventory) {
      inventory = this.inventoryRepo.create({
        variantId,
        quantity: data.quantity ?? 0,
        lowStockThreshold: data.lowStockThreshold ?? 5,
      });
    } else {
      if (data.quantity !== undefined) {
        inventory.quantity = data.quantity;
      }

      if (data.lowStockThreshold !== undefined) {
        inventory.lowStockThreshold = data.lowStockThreshold;
      }
    }

    await this.inventoryRepo.save(inventory);

    return inventory;
  }

  async getLowStockItems(brandId: string) {
    const results = await this.inventoryRepo
      .createQueryBuilder("inventory")
      .leftJoinAndSelect("inventory.variant", "variant")
      .leftJoinAndSelect("variant.product", "product")
      .where("product.brandId = :brandId", { brandId })
      .andWhere("inventory.quantity <= inventory.lowStockThreshold")
      .getMany();

    return results;
  }
}
