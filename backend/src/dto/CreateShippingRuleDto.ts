import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  Min,
} from "class-validator";

export class CreateShippingRuleDto {
  @IsString()
  @IsNotEmpty({ message: "regionName is required" })
  regionName!: string;

  // 0 is allowed: a region can ship for free.
  @IsNumber({}, { message: "shippingFee must be a number" })
  @Min(0, { message: "shippingFee cannot be negative" })
  shippingFee!: number;

  @IsOptional()
  @IsNumber({}, { message: "freeShippingThreshold must be a number" })
  @IsPositive({ message: "freeShippingThreshold must be a positive number" })
  freeShippingThreshold?: number;

  @IsString()
  @IsNotEmpty({ message: "deliveryEstimate is required" })
  deliveryEstimate!: string;
}
