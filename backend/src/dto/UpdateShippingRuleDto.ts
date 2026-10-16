import { IsString, IsNumber, IsPositive, IsOptional } from "class-validator";

export class UpdateShippingRuleDto {
  @IsOptional()
  @IsString()
  regionName?: string;

  @IsOptional()
  @IsNumber({}, { message: "shippingFee must be a number" })
  @IsPositive({ message: "shippingFee must be a positive number" })
  shippingFee?: number;

  @IsOptional()
  @IsNumber({}, { message: "freeShippingThreshold must be a number" })
  @IsPositive({ message: "freeShippingThreshold must be a positive number" })
  freeShippingThreshold?: number;

  @IsOptional()
  @IsString()
  deliveryEstimate?: string;
}
