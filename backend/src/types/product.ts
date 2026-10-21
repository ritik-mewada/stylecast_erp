// TypeScript types for product-related inputs. Covers creating a product (with
// optional variants and images), updating one (optionally replacing its
// variants and images), and the sub-types for variants and images.

import { ProductStatus } from "../entity/Product";

export interface CreateVariantInput {
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  priceOverride?: number | null;
}

export interface UpdateVariantInput extends CreateVariantInput {
  id?: string;
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
  status?: ProductStatus;
  variants?: CreateVariantInput[];
  images?: CreateImageInput[];
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  status?: ProductStatus;
  variants?: UpdateVariantInput[];
  images?: CreateImageInput[];
}

export interface ProductListFilters {
  category?: string;
  status?: ProductStatus;
  search?: string;
}
