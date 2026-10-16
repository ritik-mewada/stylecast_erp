import { AppDataSource } from "../data-source";
import { Brand, BrandApprovalStatus } from "../entity/Brand";
import { UpdateBrandInput } from "../types/brand";
import { AppError } from "../utils/AppError";

export class BrandService {
  private brandRepository = AppDataSource.getRepository(Brand);

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

    const {
      approvalStatus, // deliberately excluded — use updateApprovalStatus for this
      ...safeUpdates
    } = data;

    Object.assign(brand, safeUpdates);

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
    await this.brandRepository.save(brand);

    return brand;
  }
}
