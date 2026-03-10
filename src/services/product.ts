import { AppDataSource } from "../data-source";
import { Product, ProductStatus } from "../entity/Product";
import { ProductVariant } from "../entity/ProductVariant";

import { CreateProductInput, UpdateProductInput } from "../types/product";

export class ProductService {
  private productRepository = AppDataSource.getRepository(Product);
  private variantRepository = AppDataSource.getRepository(ProductVariant);

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
      basePrice: data.basePrice,
      brandId,
      status: ProductStatus.ACTIVE,
    });

    await this.productRepository.save(product);

    if (data.variants?.length) {
      const variants = data.variants.map((variant) =>
        this.variantRepository.create({
          sku: variant.sku,
          size: variant.size || "",
          color: variant.color || "",
          material: variant.material || "",
          priceOverride: variant.priceOverride,
          productId: product.id,
        }),
      );

      await this.variantRepository.save(variants);
    }

    return this.productRepository.findOne({
      where: { id: product.id, brandId },
      relations: ["variants"],
    });
  }

  async getProducts(brandId: string) {
    return this.productRepository.find({
      where: { brandId, status: ProductStatus.ACTIVE },
      relations: ["variants"],
      order: { createdAt: "DESC" },
    });
  }

  async getProductById(productId: string, brandId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId, brandId },
      relations: ["variants"],
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
