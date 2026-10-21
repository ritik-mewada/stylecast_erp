import { Brackets, EntityManager, In, Not } from "typeorm";
import { AppDataSource } from "../data-source";
import { Product, ProductStatus } from "../entity/Product";
import { ProductVariant } from "../entity/ProductVariant";
import { ProductImage } from "../entity/ProductImage";
import { Inventory } from "../entity/Inventory";
import { OrderItem } from "../entity/OrderItem";
import {
  CreateImageInput,
  CreateProductInput,
  ProductListFilters,
  UpdateProductInput,
  UpdateVariantInput,
} from "../types/product";
import { AppError } from "../utils/AppError";
import { likePattern, paginated, parsePagination } from "../utils/pagination";

export class ProductService {
  private productRepository = AppDataSource.getRepository(Product);

  async createProduct(brandId: string, data: CreateProductInput) {
    const productId = await AppDataSource.transaction(async (m) => {
      const product = await m.save(
        m.create(Product, {
          title: data.title,
          description: data.description || "",
          category: data.category,
          price: data.price,
          brandId,
          status: data.status ?? ProductStatus.ACTIVE,
        }),
      );

      if (data.variants?.length) {
        await this.syncVariants(m, product.id, data.variants);
      }
      if (data.images?.length) {
        await this.replaceImages(m, product.id, data.images);
      }

      return product.id;
    });

    return this.getProductById(productId, brandId);
  }

  async getProducts(
    brandId: string,
    page: unknown,
    limit: unknown,
    filters: ProductListFilters = {},
  ) {
    const p = parsePagination(page, limit);

    const query = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.variants", "variants")
      .leftJoinAndSelect("variants.inventory", "inventory")
      .leftJoinAndSelect("product.images", "images")
      .where("product.brandId = :brandId", { brandId })
      .orderBy("product.createdAt", "DESC")
      .skip(p.skip)
      .take(p.limit);

    if (filters.category) {
      query.andWhere("product.category = :category", {
        category: filters.category,
      });
    }

    if (filters.status) {
      query.andWhere("product.status = :status", { status: filters.status });
    }

    // Matches the title or any variant's SKU. EXISTS keeps every variant of a
    // matching product in the result, not just the one whose SKU matched.
    if (filters.search) {
      query.andWhere(
        new Brackets((qb) =>
          qb
            .where("product.title ILIKE :search")
            .orWhere(
              `EXISTS (SELECT 1 FROM product_variants v WHERE v."productId" = product.id AND v.sku ILIKE :search)`,
            ),
        ),
        { search: likePattern(filters.search) },
      );
    }

    const [products, total] = await query.getManyAndCount();

    return paginated(products, total, p.page, p.limit);
  }

  async getProductById(productId: string, brandId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId, brandId },
      relations: ["variants", "variants.inventory", "images"],
      order: { images: { sortOrder: "ASC" } },
    });

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    return product;
  }

  async updateProduct(
    productId: string,
    brandId: string,
    data: UpdateProductInput,
  ) {
    await AppDataSource.transaction(async (m) => {
      const product = await m.findOne(Product, {
        where: { id: productId, brandId },
      });

      if (!product) {
        throw new AppError(404, "Product not found");
      }

      const { variants, images, ...fields } = data;
      Object.assign(product, fields);
      await m.save(product);

      if (variants) {
        await this.syncVariants(m, product.id, variants);
      }
      if (images) {
        await this.replaceImages(m, product.id, images);
      }
    });

    return this.getProductById(productId, brandId);
  }

  async archiveProduct(productId: string, brandId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId, brandId },
    });

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    product.status = ProductStatus.ARCHIVED;
    await this.productRepository.save(product);

    return { message: "Product archived successfully" };
  }

  // Makes the product's variants match `inputs`: entries with an id update
  // that variant, entries without one are created (with an empty inventory
  // record), and existing variants that aren't listed are deleted. Variants
  // that appear on orders can't be deleted; archive the product instead.
  private async syncVariants(
    m: EntityManager,
    productId: string,
    inputs: UpdateVariantInput[],
  ) {
    const existing = await m.find(ProductVariant, { where: { productId } });
    const existingById = new Map(existing.map((v) => [v.id, v]));

    const unknownIds = inputs
      .map((v) => v.id)
      .filter((id): id is string => !!id && !existingById.has(id));
    if (unknownIds.length > 0) {
      throw new AppError(404, "Variant not found on this product", {
        variantIds: unknownIds,
      });
    }

    const skus = inputs.map((v) => v.sku);
    const repeated = [...new Set(skus.filter((sku, i) => skus.indexOf(sku) !== i))];
    if (repeated.length > 0) {
      throw new AppError(409, `Duplicate SKUs in request: ${repeated.join(", ")}`);
    }

    const taken = await m.find(ProductVariant, {
      where: { sku: In(skus), productId: Not(productId) },
    });
    if (taken.length > 0) {
      throw new AppError(
        409,
        `One or more SKUs already exist: ${taken.map((v) => v.sku).join(", ")}`,
      );
    }

    const keptIds = new Set(inputs.map((v) => v.id).filter(Boolean));
    const removed = existing.filter((v) => !keptIds.has(v.id));
    if (removed.length > 0) {
      const ordered = await m.find(OrderItem, {
        where: { variantId: In(removed.map((v) => v.id)) },
        select: { variantId: true },
      });
      if (ordered.length > 0) {
        const orderedIds = new Set(ordered.map((item) => item.variantId));
        throw new AppError(409, "Variants that have orders can't be removed", {
          skus: removed.filter((v) => orderedIds.has(v.id)).map((v) => v.sku),
        });
      }
      await m.delete(ProductVariant, removed.map((v) => v.id));
    }

    for (const input of inputs) {
      const fields = {
        sku: input.sku,
        size: input.size || "",
        color: input.color || "",
        material: input.material || "",
        priceOverride: input.priceOverride ?? null,
      };

      if (input.id) {
        await m.save(Object.assign(existingById.get(input.id)!, fields));
        continue;
      }

      // Every variant gets an inventory record, so stock can be read and set
      // as soon as the product exists.
      const variant = await m.save(m.create(ProductVariant, { productId, ...fields }));
      await m.save(
        m.create(Inventory, { variantId: variant.id, quantity: 0, lowStockThreshold: 5 }),
      );
    }
  }

  private async replaceImages(
    m: EntityManager,
    productId: string,
    images: CreateImageInput[],
  ) {
    await m.delete(ProductImage, { productId });

    if (images.length === 0) {
      return;
    }

    await m.save(
      images.map((image, index) =>
        m.create(ProductImage, {
          productId,
          imageUrl: image.imageUrl,
          altText: image.altText || "",
          sortOrder: image.sortOrder ?? index,
        }),
      ),
    );
  }
}
