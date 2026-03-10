import { BrandApprovalStatus } from "../entity/Brand";

export interface UpdateBrandInput {
  name?: string;
  slug?: string;
  companyInfo?: string;
  website?: string;
  shippingOrigin?: string;
  brandCategory?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive?: boolean;
  approvalStatus?: BrandApprovalStatus;
}
