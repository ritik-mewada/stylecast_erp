import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsUrl,
  IsInt,
  Min,
  ValidateNested,
  IsArray,
  IsEnum,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";
import { ProductStatus } from "../entity/Product";

export class CreateVariantDto {
  @IsString()
  @IsNotEmpty({ message: "variant sku is required" })
  sku!: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  material?: string;

  // null (or omitted) means the variant uses the product price.
  @IsOptional()
  @IsNumber({}, { message: "priceOverride must be a number" })
  @IsPositive({ message: "priceOverride must be a positive number" })
  priceOverride?: number | null;
}

// Variants in PUT /products/:id: with an id to update an existing variant,
// without one to add a new variant.
export class UpdateVariantDto extends CreateVariantDto {
  @IsOptional()
  @IsUUID("all", { message: "variant id must be a valid UUID" })
  id?: string;
}

export class CreateImageDto {
  // require_tld: false so images uploaded to a local API (http://localhost:3000/...) validate.
  @IsUrl(
    { require_tld: false, require_protocol: true, protocols: ["http", "https"] },
    { message: "imageUrl must be a valid http(s) URL" },
  )
  imageUrl!: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: "title is required" })
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({}, { message: "price must be a number" })
  @IsPositive({ message: "price must be a positive number" })
  price!: number;

  @IsString()
  @IsNotEmpty({ message: "category is required" })
  category!: string;

  @IsOptional()
  @IsEnum(ProductStatus, { message: "Invalid product status" })
  status?: ProductStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImageDto)
  images?: CreateImageDto[];
}
