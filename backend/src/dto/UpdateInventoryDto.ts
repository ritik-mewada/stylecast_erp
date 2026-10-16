import { IsInt, IsOptional, Min } from "class-validator";

export class UpdateInventoryDto {
  @IsOptional()
  @IsInt({ message: "quantity must be an integer" })
  @Min(0, { message: "quantity cannot be negative" })
  quantity?: number;

  @IsOptional()
  @IsInt({ message: "lowStockThreshold must be an integer" })
  @Min(0, { message: "lowStockThreshold cannot be negative" })
  lowStockThreshold?: number;
}
