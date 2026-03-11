// Business logic for brand profile operations. Includes fetching a brand by ID
// and updating its profile. On updates, it makes sure the new name/slug aren't
// already taken by someone else, and explicitly blocks changing the approval
// status through this route (that's an admin-only concern).

import { AppDataSource } from "../data-source";
import { Brand, BrandApprovalStatus } from "../entity/Brand";
import { UpdateBrandInput } from "../types/brand";

export class BrandService {
  private brandRepository = AppDataSource.getRepository(Brand);

  async getMyBrand(brandId: string) {
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
    });

    if (!brand) {
      throw new Error("Brand not found");
    }

    return brand;
  }

  async updateBrandProfile(brandId: string, data: UpdateBrandInput) {
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
    });

    if (!brand) {
      throw new Error("Brand not found");
    }

    if (data.slug && data.slug !== brand.slug) {
      const existingSlug = await this.brandRepository.findOne({
        where: { slug: data.slug },
      });

      if (existingSlug) {
        throw new Error("Slug already in use");
      }
    }

    if (data.name && data.name !== brand.name) {
      const existingName = await this.brandRepository.findOne({
        where: { name: data.name },
      });

      if (existingName) {
        throw new Error("Brand name already in use");
      }
    }

    const {
      approvalStatus, // deliberately excluded
      ...safeUpdates
    } = data;

    Object.assign(brand, safeUpdates);

    await this.brandRepository.save(brand);

    return brand;
  }

  async updateApprovalStatus(brandId: string, approvalStatus: BrandApprovalStatus) {
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
    });

    if (!brand) {
      throw new Error("Brand not found");
    }

    brand.approvalStatus = approvalStatus;
    await this.brandRepository.save(brand);

    return brand;
  }
}
