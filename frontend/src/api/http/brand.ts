import type { Brand } from "@/types/models"
import { text } from "./client"

// Brand responses keep empty profile fields as null; the pages expect strings.
export type ApiBrand = Omit<
  Brand,
  "companyInfo" | "website" | "shippingOrigin" | "brandCategory" | "contactEmail" | "contactPhone"
> &
  Record<
    "companyInfo" | "website" | "shippingOrigin" | "brandCategory" | "contactEmail" | "contactPhone",
    string | null
  >

export const toBrand = (brand: ApiBrand): Brand => ({
  ...brand,
  companyInfo: text(brand.companyInfo),
  website: text(brand.website),
  shippingOrigin: text(brand.shippingOrigin),
  brandCategory: text(brand.brandCategory),
  contactEmail: text(brand.contactEmail),
  contactPhone: text(brand.contactPhone),
})
