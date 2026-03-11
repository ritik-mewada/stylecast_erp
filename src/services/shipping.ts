// Logic for managing a brand's shipping rules. Fairly straightforward CRUD —
// create, list, update, and delete. Rules are always scoped to the brand so
// you can't accidentally touch another brand's shipping config.

import { AppDataSource } from "../data-source";
import { ShippingRule } from "../entity/ShippingRule";
import {
  CreateShippingRuleInput,
  UpdateShippingRuleInput,
} from "../types/shipping";

export class ShippingService {
  private shippingRepo = AppDataSource.getRepository(ShippingRule);

  async createRule(brandId: string, data: CreateShippingRuleInput) {
    const rule = this.shippingRepo.create({
      brandId,
      ...data,
    });

    await this.shippingRepo.save(rule);

    return rule;
  }

  async getRules(brandId: string) {
    return this.shippingRepo.find({
      where: { brandId },
      order: { createdAt: "DESC" },
    });
  }

  async updateRule(id: string, brandId: string, data: UpdateShippingRuleInput) {
    const rule = await this.shippingRepo.findOne({
      where: { id, brandId },
    });

    if (!rule) {
      throw new Error("Shipping rule not found");
    }

    Object.assign(rule, data);

    await this.shippingRepo.save(rule);

    return rule;
  }

  async deleteRule(id: string, brandId: string) {
    const rule = await this.shippingRepo.findOne({
      where: { id, brandId },
    });

    if (!rule) {
      throw new Error("Shipping rule not found");
    }

    await this.shippingRepo.remove(rule);

    return { message: "Shipping rule deleted" };
  }
}
