import { IsIn } from "class-validator";
import { BRAND_ROLES, UserRole } from "../utils";

// Input for PATCH /users/:id/role. Only brand roles: nobody can be made a
// platform admin through the API.
export class UpdateUserRoleDto {
  @IsIn(BRAND_ROLES, { message: `role must be one of: ${BRAND_ROLES.join(", ")}` })
  role!: UserRole;
}
