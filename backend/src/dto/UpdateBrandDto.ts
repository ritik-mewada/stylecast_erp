import { IsString, IsEmail, IsBoolean, IsOptional } from "class-validator";

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
}
