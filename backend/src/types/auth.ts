// TypeScript types for authentication inputs. RegisterInput covers everything
// needed to create a new brand + owner account, and LoginInput is just the
// email/password pair for signing in.

import { UserRole } from "../utils";

export interface RegisterInput {
  brandName: string;
  brandSlug: string;
  companyInfo?: string;
  website?: string;
  shippingOrigin?: string;
  brandCategory?: string;
  contactEmail?: string;
  contactPhone?: string;
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
