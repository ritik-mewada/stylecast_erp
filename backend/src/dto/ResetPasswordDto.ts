import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: "token is required" })
  token!: string;

  @IsString()
  @MinLength(8, { message: "newPassword must be at least 8 characters" })
  newPassword!: string;
}
