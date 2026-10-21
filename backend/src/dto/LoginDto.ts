import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { NormalizeEmail } from "./normalize";

export class LoginDto {
  @NormalizeEmail()
  @IsEmail({}, { message: "email must be a valid email address" })
  @IsNotEmpty({ message: "email is required" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "password is required" })
  password!: string;
}
