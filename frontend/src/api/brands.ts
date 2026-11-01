import type { Brand } from "@/types/models"
import type * as Impl from "./http/brands"
import { DEMO_MODE, lazyApi } from "./mode"

export type UpdateBrandInput = Partial<
  Pick<Brand, "name" | "companyInfo" | "website" | "shippingOrigin" | "brandCategory" | "contactEmail" | "contactPhone">
>

const api = lazyApi((): Promise<typeof Impl> => (DEMO_MODE ? import("./mock/brands") : import("./http/brands")))

export const getMyBrand = api("getMyBrand")
export const updateMyBrand = api("updateMyBrand")
export const listBrands = api("listBrands")
export const setBrandApproval = api("setBrandApproval")
export const getPlatformStats = api("getPlatformStats")
