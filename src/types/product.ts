import { ProductStatus } from "../entity/Product";

export interface CreateVariantInput {
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  priceOverride?: number;
}

export interface CreateProductInput {
  title: string;
  description?: string;
  category: string;
  basePrice: number;
  variants?: CreateVariantInput[];
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  category?: string;
  basePrice?: number;
  status?: ProductStatus;
}
