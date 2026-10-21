import { IsString, IsEmail, IsNotEmpty, IsOptional } from "class-validator";
import { NormalizeSlug, Trim } from "./normalize";

export class UpdateBrandDto {
  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: "name cannot be empty" })
  name?: string;

  @IsOptional()
  @NormalizeSlug("slug")
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
}
