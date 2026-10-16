import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsEnum,
} from "class-validator";
import { UserRole } from "../utils";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: "firstName is required" })
  firstName!: string;

  @IsString()
  @IsNotEmpty({ message: "lastName is required" })
  lastName!: string;

  @IsEmail({}, { message: "email must be a valid email address" })
  email!: string;

  @IsString()
  @MinLength(8, { message: "password must be at least 8 characters" })
  password!: string;

  @IsEnum(UserRole, { message: "role must be one of: brand_owner, brand_manager, operations_manager" })
  role!: UserRole;
}
