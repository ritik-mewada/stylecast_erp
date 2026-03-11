// Type definition for updating a brand's profile. All fields are optional since
// you might only want to update one or two things at a time. Note that
// approvalStatus is intentionally excluded from the service layer — it's here
// only so the type is complete but it gets stripped out before saving.

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
