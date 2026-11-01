import type { Brand, BrandApprovalStatus } from "@/types/models"
import type { UpdateBrandInput } from "../brands"
import { toBrand } from "./brand"
import { getPaginated, http } from "./client"

export async function getMyBrand(): Promise<Brand> {
  return toBrand((await http.get("/brands/me")).data)
}

export async function updateMyBrand(input: UpdateBrandInput): Promise<Brand> {
  return toBrand((await http.put("/brands/profile", input)).data.brand)
}

// The admin pages show every brand on one screen; the list is paginated, so
// read it all (brand counts are small).
export async function listBrands(status?: BrandApprovalStatus): Promise<Brand[]> {
  return (await getPaginated("/brands", { status, limit: Number.MAX_SAFE_INTEGER }, toBrand)).data
}

export async function setBrandApproval(id: string, status: BrandApprovalStatus): Promise<Brand> {
  return toBrand((await http.patch(`/brands/${id}/approval`, { approvalStatus: status })).data.brand)
}

export async function getPlatformStats(): Promise<{
  brands: number
  pending: number
  approved: number
  rejected: number
  users: number
}> {
  return (await http.get("/brands/stats")).data
}
