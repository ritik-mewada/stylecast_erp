import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { NormalizeEmail } from "./normalize";

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "firstName cannot be empty" })
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: "lastName cannot be empty" })
  lastName?: string;

  @IsOptional()
  @NormalizeEmail()
  @IsEmail({}, { message: "email must be a valid email address" })
  email?: string;
}
