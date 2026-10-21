import { IsEmail } from "class-validator";
import { NormalizeEmail } from "./normalize";

export class ForgotPasswordDto {
  @NormalizeEmail()
  @IsEmail({}, { message: "email must be a valid email address" })
  email!: string;
}
