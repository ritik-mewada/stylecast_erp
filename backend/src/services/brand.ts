import { Not, IsNull } from "typeorm";
import { AppDataSource } from "../data-source";
import { Brand, BrandApprovalStatus } from "../entity/Brand";
import { User } from "../entity/User";
import { UpdateBrandInput } from "../types/brand";
import { AppError } from "../utils/AppError";
import { paginated, parsePagination } from "../utils/pagination";

export class BrandService {
  private brandRepository = AppDataSource.getRepository(Brand);
  private userRepository = AppDataSource.getRepository(User);

  // Platform admin: every brand, newest first, optionally filtered by status.
  async listBrands(status?: BrandApprovalStatus, page?: unknown, limit?: unknown) {
    const p = parsePagination(page, limit);
    const [brands, total] = await this.brandRepository.findAndCount({
      where: status ? { approvalStatus: status } : {},
      order: { createdAt: "DESC" },
      skip: p.skip,
      take: p.limit,
    });
    return paginated(brands, total, p.page, p.limit);
  }

  // Platform admin overview: brand counts by approval status and the number
  // of brand users (platform admins are not counted).
  async getPlatformStats() {
    const counts = await this.brandRepository
      .createQueryBuilder("brand")
      .select("brand.approvalStatus", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("brand.approvalStatus")
      .getRawMany<{ status: BrandApprovalStatus; count: string }>();

    const byStatus = (status: BrandApprovalStatus) =>
      Number(counts.find((row) => row.status === status)?.count ?? 0);

    const users = await this.userRepository.count({
      where: { brandId: Not(IsNull()) },
    });

    return {
      brands: counts.reduce((sum, row) => sum + Number(row.count), 0),
      pending: byStatus(BrandApprovalStatus.PENDING),
      approved: byStatus(BrandApprovalStatus.APPROVED),
      rejected: byStatus(BrandApprovalStatus.REJECTED),
      users,
    };
  }

  async getMyBrand(brandId: string) {
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
    });

    if (!brand) {
      throw new AppError(404, "Brand not found");
    }

    return brand;
  }

  async updateBrandProfile(brandId: string, data: UpdateBrandInput) {
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
    });

    if (!brand) {
      throw new AppError(404, "Brand not found");
    }

    if (data.slug && data.slug !== brand.slug) {
      const existingSlug = await this.brandRepository.findOne({
        where: { slug: data.slug },
      });

      if (existingSlug) {
        throw new AppError(409, "Slug is already in use");
      }
    }

    if (data.name && data.name !== brand.name) {
      const existingName = await this.brandRepository.findOne({
        where: { name: data.name },
      });

      if (existingName) {
        throw new AppError(409, "Brand name is already in use");
      }
    }

    Object.assign(brand, data);

    await this.brandRepository.save(brand);

    return brand;
  }

  async updateApprovalStatus(
    brandId: string,
    approvalStatus: BrandApprovalStatus,
  ) {
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
    });

    if (!brand) {
      throw new AppError(404, "Brand not found");
    }

    brand.approvalStatus = approvalStatus;
    // A rejected brand is marked inactive; approving it again (or putting it
    // back to pending) reactivates it. It keeps its data and can still sign
    // in, but only approved brands can take orders.
    brand.isActive = approvalStatus !== BrandApprovalStatus.REJECTED;
    await this.brandRepository.save(brand);

    return brand;
  }
}
