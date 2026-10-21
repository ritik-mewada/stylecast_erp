import { AppDataSource } from "../data-source";
import { Inventory } from "../entity/Inventory";
import { ProductStatus } from "../entity/Product";
import { ProductVariant } from "../entity/ProductVariant";
import { UpdateInventoryInput } from "../types/inventory";
import { AppError } from "../utils/AppError";

export class InventoryService {
  private inventoryRepo = AppDataSource.getRepository(Inventory);
  private variantRepo = AppDataSource.getRepository(ProductVariant);

  // Variants are only visible to the brand that owns their product. Another
  // brand's variant gets the same 404 as a missing one, so ids don't leak.
  private async assertVariantInBrand(variantId: string, brandId: string) {
    const exists = await this.variantRepo
      .createQueryBuilder("variant")
      .innerJoin("variant.product", "product")
      .where("variant.id = :variantId", { variantId })
      .andWhere("product.brandId = :brandId", { brandId })
      .getExists();

    if (!exists) {
      throw new AppError(404, "Variant not found");
    }
  }

  async getInventoryByVariant(variantId: string, brandId: string) {
    await this.assertVariantInBrand(variantId, brandId);

    const inventory = await this.inventoryRepo.findOne({
      where: { variantId },
    });

    if (!inventory) {
      throw new AppError(404, "Inventory record not found for this variant");
    }

    return inventory;
  }

  async updateInventory(
    variantId: string,
    brandId: string,
    data: UpdateInventoryInput,
  ) {
    await this.assertVariantInBrand(variantId, brandId);

    let inventory = await this.inventoryRepo.findOne({ where: { variantId } });

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

  // Low-stock alerts for active products only: archived products aren't
  // restocked, so they shouldn't raise alerts.
  async getLowStockItems(brandId: string) {
    return this.inventoryRepo
      .createQueryBuilder("inventory")
      .innerJoinAndSelect("inventory.variant", "variant")
      .innerJoinAndSelect("variant.product", "product")
      .where("product.brandId = :brandId", { brandId })
      .andWhere("product.status = :active", { active: ProductStatus.ACTIVE })
      .andWhere("inventory.quantity <= inventory.lowStockThreshold")
      .orderBy("inventory.quantity", "ASC")
      .getMany();
  }
}
