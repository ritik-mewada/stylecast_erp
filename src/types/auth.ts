import { UserRole } from "../utils";

export interface RegisterInput {
  brandName: string;
  brandSlug: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}
