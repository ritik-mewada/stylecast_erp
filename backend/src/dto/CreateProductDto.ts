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
} from "class-validator";
import { Type } from "class-transformer";

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

  @IsOptional()
  @IsNumber({}, { message: "priceOverride must be a number" })
  @IsPositive({ message: "priceOverride must be a positive number" })
  priceOverride?: number;
}

export class CreateImageDto {
  @IsUrl({}, { message: "imageUrl must be a valid URL" })
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
