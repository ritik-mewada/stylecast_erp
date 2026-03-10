import { UserRole } from "../utils";

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}
