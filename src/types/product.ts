import { ProductStatus } from "../entity/Product";

export interface CreateVariantInput {
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  priceOverride?: number;
}

export interface CreateImageInput {
  imageUrl: string;
  altText?: string;
  sortOrder?: number;
}

export interface CreateProductInput {
  title: string;
  description?: string;
  price: number;
  category: string;
  variants?: CreateVariantInput[];
  images?: CreateImageInput[];
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  status?: ProductStatus;
}
