import type { Brand, BrandApprovalStatus } from "@/types/models"
import { currentBrandId, currentUser, requirePermission } from "./auth"
import { ApiError, clone, db, delay, timestamp } from "./db"
import type { UpdateBrandInput } from "../brands"

// GET /brands/me
export async function getMyBrand(): Promise<Brand> {
  await delay()
  const brand = db.brands.find((b) => b.id === currentBrandId())
  if (!brand) throw new ApiError(404, "Brand not found")
  return clone(brand)
}

// PUT /brands/profile
export async function updateMyBrand(input: UpdateBrandInput): Promise<Brand> {
  await delay()
  requirePermission("editBrand")
  const brand = db.brands.find((b) => b.id === currentBrandId())
  if (!brand) throw new ApiError(404, "Brand not found")
  Object.assign(brand, input, { updatedAt: timestamp() })
  return clone(brand)
}

const requireAdmin = () => {
  if (currentUser().role !== "platform_admin") throw new ApiError(403, "Platform admin only")
}

// GET /brands?status=  (platform admin, added in Step 1)
export async function listBrands(status?: BrandApprovalStatus): Promise<Brand[]> {
  await delay()
  requireAdmin()
  return clone(
    db.brands
      .filter((b) => !status || b.approvalStatus === status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  )
}

// PATCH /brands/:id/approval
export async function setBrandApproval(id: string, status: BrandApprovalStatus): Promise<Brand> {
  await delay()
  requireAdmin()
  const brand = db.brands.find((b) => b.id === id)
  if (!brand) throw new ApiError(404, "Brand not found")
  brand.approvalStatus = status
  brand.isActive = status !== "rejected"
  brand.updatedAt = timestamp()
  return clone(brand)
}

// Platform-wide counts for the admin overview. Not in the API yet.
export async function getPlatformStats() {
  await delay()
  requireAdmin()
  return {
    brands: db.brands.length,
    pending: db.brands.filter((b) => b.approvalStatus === "pending").length,
    approved: db.brands.filter((b) => b.approvalStatus === "approved").length,
    rejected: db.brands.filter((b) => b.approvalStatus === "rejected").length,
    users: db.users.filter((u) => u.role !== "platform_admin").length,
  }
}
