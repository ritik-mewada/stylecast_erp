// Type for creating a new brand team member. All fields are required — you need
// their name, email, password, and the role they'll have within the brand.

import { UserRole } from "../utils";

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateMeInput {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
