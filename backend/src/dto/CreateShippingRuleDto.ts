import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
} from "class-validator";

export class CreateShippingRuleDto {
  @IsString()
  @IsNotEmpty({ message: "regionName is required" })
  regionName!: string;

  @IsNumber({}, { message: "shippingFee must be a number" })
  @IsPositive({ message: "shippingFee must be a positive number" })
  shippingFee!: number;

  @IsOptional()
  @IsNumber({}, { message: "freeShippingThreshold must be a number" })
  @IsPositive({ message: "freeShippingThreshold must be a positive number" })
  freeShippingThreshold?: number;

  @IsString()
  @IsNotEmpty({ message: "deliveryEstimate is required" })
  deliveryEstimate!: string;
}
