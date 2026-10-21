import { IsEnum } from "class-validator";
import { BrandApprovalStatus } from "../entity/Brand";

export class UpdateBrandApprovalDto {
  @IsEnum(BrandApprovalStatus, {
    message: `approvalStatus must be one of: ${Object.values(BrandApprovalStatus).join(", ")}`,
  })
  approvalStatus!: BrandApprovalStatus;
}
