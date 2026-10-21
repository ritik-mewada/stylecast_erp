import { Brackets } from "typeorm";
import { AppDataSource } from "../data-source";
import { Inventory } from "../entity/Inventory";
import { ProductStatus } from "../entity/Product";
import { ProductVariant } from "../entity/ProductVariant";
import { InventoryListFilters, UpdateInventoryInput } from "../types/inventory";
import { AppError } from "../utils/AppError";
import { likePattern, paginated, parsePagination } from "../utils/pagination";

// A variant with no inventory row counts as 0 in stock with the default threshold.
const QUANTITY = "COALESCE(inventory.quantity, 0)";
const THRESHOLD = "COALESCE(inventory.lowStockThreshold, 5)";

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

  // One row per variant of the brand's active products, for the inventory
  // table. `low` means at or below the threshold (including out of stock),
  // `out` means zero. The summary counts ignore the filters, so the tabs can
  // show their totals.
  async listInventory(
    brandId: string,
    page: unknown,
    limit: unknown,
    filters: InventoryListFilters = {},
  ) {
    const p = parsePagination(page, limit, 50);

    const base = () =>
      this.variantRepo
        .createQueryBuilder("variant")
        .innerJoin("variant.product", "product")
        .leftJoin("variant.inventory", "inventory")
        .where("product.brandId = :brandId", { brandId })
        .andWhere("product.status = :active", { active: ProductStatus.ACTIVE });

    const query = base()
      .select("variant.id", "variantId")
      .addSelect("variant.sku", "sku")
      .addSelect("variant.size", "size")
      .addSelect("variant.color", "color")
      .addSelect("variant.material", "material")
      .addSelect("product.id", "productId")
      .addSelect("product.title", "productTitle")
      .addSelect("product.category", "category")
      .addSelect(QUANTITY, "quantity")
      .addSelect(THRESHOLD, "lowStockThreshold")
      .addSelect("inventory.updatedAt", "updatedAt");

    if (filters.status === "low") {
      query.andWhere(`${QUANTITY} <= ${THRESHOLD}`);
    } else if (filters.status === "out") {
      query.andWhere(`${QUANTITY} = 0`);
    }

    if (filters.search) {
      query.andWhere(
        new Brackets((qb) =>
          qb.where("product.title ILIKE :search").orWhere("variant.sku ILIKE :search"),
        ),
        { search: likePattern(filters.search) },
      );
    }

    if (filters.status) {
      query.orderBy(QUANTITY, "ASC").addOrderBy("product.title", "ASC");
    } else {
      query.orderBy("product.title", "ASC");
    }
    query.addOrderBy("variant.sku", "ASC");

    const [rows, total, summary] = await Promise.all([
      query.offset(p.skip).limit(p.limit).getRawMany(),
      query.getCount(),
      base()
        .select("COUNT(variant.id)", "variants")
        .addSelect(`COALESCE(SUM(${QUANTITY}), 0)`, "units")
        .addSelect(`COUNT(*) FILTER (WHERE ${QUANTITY} > 0 AND ${QUANTITY} <= ${THRESHOLD})`, "low")
        .addSelect(`COUNT(*) FILTER (WHERE ${QUANTITY} = 0)`, "out")
        .getRawOne(),
    ]);

    return {
      ...paginated(rows, total, p.page, p.limit),
      summary: {
        variants: Number(summary?.variants ?? 0),
        units: Number(summary?.units ?? 0),
        low: Number(summary?.low ?? 0),
        out: Number(summary?.out ?? 0),
      },
    };
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
