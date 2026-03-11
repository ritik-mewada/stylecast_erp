import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
} from "class-validator";
import { ProductStatus } from "../entity/Product";

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
}
