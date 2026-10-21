import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: "currentPassword is required" })
  currentPassword!: string;

  @IsString()
  @MinLength(8, { message: "newPassword must be at least 8 characters" })
  newPassword!: string;
}
