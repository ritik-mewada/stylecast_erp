import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
} from "class-validator";
import { UserRole } from "../utils";

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: "brandName is required" })
  brandName!: string;

  @IsString()
  @IsNotEmpty({ message: "brandSlug is required" })
  brandSlug!: string;

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

  @IsString()
  @IsNotEmpty({ message: "firstName is required" })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: "lastName is required" })
  lastName!: string;

  @IsEmail({}, { message: "email must be a valid email address" })
  @IsNotEmpty({ message: "email is required" })
  email!: string;

  @IsString()
  @MinLength(8, { message: "password must be at least 8 characters" })
  password!: string;

  @IsOptional()
  @IsEnum(UserRole, { message: "Invalid role" })
  role?: UserRole;
}
