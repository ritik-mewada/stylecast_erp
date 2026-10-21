import { IsString, IsNumber, IsPositive, IsOptional, Min } from "class-validator";

export class UpdateShippingRuleDto {
  @IsOptional()
  @IsString()
  regionName?: string;

  @IsOptional()
  @IsNumber({}, { message: "shippingFee must be a number" })
  @Min(0, { message: "shippingFee cannot be negative" })
  shippingFee?: number;

  @IsOptional()
  @IsNumber({}, { message: "freeShippingThreshold must be a number" })
  @IsPositive({ message: "freeShippingThreshold must be a positive number" })
  freeShippingThreshold?: number;

  @IsOptional()
  @IsString()
  deliveryEstimate?: string;
}
