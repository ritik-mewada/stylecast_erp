import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateOrderItemDto {
  @IsUUID("all", { message: "variantId must be a valid UUID" })
  variantId!: string;

  @IsInt({ message: "quantity must be an integer" })
  @Min(1, { message: "quantity must be at least 1" })
  @Max(1000, { message: "quantity cannot exceed 1000" })
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: "customerName is required" })
  customerName!: string;

  @IsEmail({}, { message: "customerEmail must be a valid email address" })
  customerEmail!: string;

  @IsString()
  @IsNotEmpty({ message: "shippingCountry is required" })
  shippingCountry!: string;

  @IsString()
  @IsNotEmpty({ message: "shippingCity is required" })
  shippingCity!: string;

  @IsString()
  @IsNotEmpty({ message: "shippingPostalCode is required" })
  shippingPostalCode!: string;

  @IsOptional()
  @IsString()
  shippingAddressLine1?: string;

  @IsOptional()
  @IsString()
  shippingAddressLine2?: string;

  @IsOptional()
  @IsString()
  shippingStateOrProvince?: string;

  @IsArray({ message: "items must be an array" })
  @ArrayMinSize(1, { message: "an order needs at least one item" })
  @ArrayMaxSize(50, { message: "an order can have at most 50 items" })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
