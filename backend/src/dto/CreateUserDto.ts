import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsIn,
} from "class-validator";
import { BRAND_ROLES, UserRole } from "../utils";
import { NormalizeEmail } from "./normalize";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: "firstName is required" })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: "lastName is required" })
  lastName!: string;

  @NormalizeEmail()
  @IsEmail({}, { message: "email must be a valid email address" })
  email!: string;

  @IsString()
  @MinLength(8, { message: "password must be at least 8 characters" })
  password!: string;

  @IsIn(BRAND_ROLES, { message: `role must be one of: ${BRAND_ROLES.join(", ")}` })
  role!: UserRole;
}
