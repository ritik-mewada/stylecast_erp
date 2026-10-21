import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ProductStatus } from "../entity/Product";
import { CreateImageDto, UpdateVariantDto } from "./CreateProductDto";

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: "price must be a number" })
  @IsPositive({ message: "price must be a positive number" })
  price?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(ProductStatus, { message: "Invalid product status" })
  status?: ProductStatus;

  // When present, the full list of variants: listed ids are updated, new
  // entries are created, and variants left out are removed.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateVariantDto)
  variants?: UpdateVariantDto[];

  // When present, replaces all images, in the order given.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImageDto)
  images?: CreateImageDto[];
}
