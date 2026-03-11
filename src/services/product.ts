// Core product logic — creating products with variants and images in one go,
// paginated listing with optional category/status filters, update, and archive.
// Products are never hard-deleted; archiving just marks them as inactive so
// historical order data still references valid records.

import { AppDataSource } from "../data-source";
import { Product, ProductStatus } from "../entity/Product";
import { ProductVariant } from "../entity/ProductVariant";
import { ProductImage } from "../entity/ProductImage";
import { Inventory } from "../entity/Inventory";
import { CreateProductInput, UpdateProductInput } from "../types/product";

export class ProductService {
  private productRepository = AppDataSource.getRepository(Product);
  private variantRepository = AppDataSource.getRepository(ProductVariant);
  private imageRepository = AppDataSource.getRepository(ProductImage);
  private inventoryRepository = AppDataSource.getRepository(Inventory);

  async createProduct(brandId: string, data: CreateProductInput) {
    const existingSkus = data.variants?.length
      ? await this.variantRepository.find({
          where: data.variants.map((variant) => ({ sku: variant.sku })),
        })
      : [];

    if (existingSkus.length > 0) {
      throw new Error("One or more SKUs already exist");
    }

    const product = this.productRepository.create({
      title: data.title,
      description: data.description || "",
      category: data.category,
      price: data.price,
      brandId,
      status: ProductStatus.ACTIVE,
    });

    await this.productRepository.save(product);

    if (data.variants?.length) {
      const variants = data.variants.map((variant) =>
        this.variantRepository.create({
          productId: product.id,
          sku: variant.sku,
          size: variant.size || "",
          color: variant.color || "",
          material: variant.material || "",
          priceOverride: variant.priceOverride,
        }),
      );

      const savedVariants = await this.variantRepository.save(variants);

      // Auto-seed an inventory record for each new variant so that
      // GET /inventory/variant/:id works immediately after product creation.
      const inventoryRecords = savedVariants.map((variant) =>
        this.inventoryRepository.create({
          variantId: variant.id,
          quantity: 0,
          lowStockThreshold: 5,
        }),
      );
      await this.inventoryRepository.save(inventoryRecords);
    }

    if (data.images?.length) {
      const images = data.images.map((image) =>
        this.imageRepository.create({
          productId: product.id,
          imageUrl: image.imageUrl,
          altText: image.altText || "",
          sortOrder: image.sortOrder ?? 0,
        }),
      );

      await this.imageRepository.save(images);
    }

    return this.getProductById(product.id, brandId);
  }

  async getProducts(
    brandId: string,
    page = 1,
    limit = 20,
    category?: string,
    status?: ProductStatus,
  ) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const query = this.productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.variants", "variants")
      .leftJoinAndSelect("product.images", "images")
      .where("product.brandId = :brandId", { brandId })
      .orderBy("product.createdAt", "DESC")
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit);

    if (category) {
      query.andWhere("product.category = :category", { category });
    }

    if (status) {
      query.andWhere("product.status = :status", { status });
    }

    const [products, total] = await query.getManyAndCount();

    return {
      data: products,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getProductById(productId: string, brandId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId, brandId },
      relations: ["variants", "images"],
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async updateProduct(
    productId: string,
    brandId: string,
    data: UpdateProductInput,
  ) {
    const product = await this.productRepository.findOne({
      where: { id: productId, brandId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    Object.assign(product, data);
    await this.productRepository.save(product);

    return this.getProductById(productId, brandId);
  }

  async archiveProduct(productId: string, brandId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId, brandId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    product.status = ProductStatus.ARCHIVED;
    await this.productRepository.save(product);

    return {
      message: "Product archived successfully",
    };
  }
}
