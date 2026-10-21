// Type definition for updating a brand's profile. All fields are optional since
// you might only want to update one or two things at a time. Approval status
// and the active flag are not part of the profile: only a platform admin
// changes them, through PATCH /brands/:id/approval.

export interface UpdateBrandInput {
  name?: string;
  slug?: string;
  companyInfo?: string;
  website?: string;
  shippingOrigin?: string;
  brandCategory?: string;
  contactEmail?: string;
  contactPhone?: string;
}
