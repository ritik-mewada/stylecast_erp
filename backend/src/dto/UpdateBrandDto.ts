import { IsString, IsEmail, IsBoolean, IsOptional, IsEnum } from "class-validator";
import { BrandApprovalStatus } from "../entity/Brand";

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  companyInfo?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  shippingOrigin?: string;

  @IsOptional()
  @IsString()
  brandCategory?: string;

  @IsOptional()
  @IsEmail({}, { message: "contactEmail must be a valid email" })
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(BrandApprovalStatus, { message: "Invalid approval status" })
  approvalStatus?: BrandApprovalStatus;
}
