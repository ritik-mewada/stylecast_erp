import type { ShippingRule } from "@/types/models"
import { uid } from "@/mocks/seed"
import { currentBrandId, requirePermission } from "./auth"
import { ApiError, clone, db, delay, timestamp } from "./db"
import type { ShippingRuleInput } from "../shipping"

// GET /shipping
export async function listShippingRules(): Promise<ShippingRule[]> {
  await delay()
  const brandId = currentBrandId()
  return clone(db.shippingRules.filter((r) => r.brandId === brandId))
}

// POST /shipping
export async function createShippingRule(input: ShippingRuleInput): Promise<ShippingRule> {
  await delay()
  requirePermission("editShipping")
  const now = timestamp()
  const rule: ShippingRule = { id: uid(), brandId: currentBrandId(), ...input, createdAt: now, updatedAt: now }
  db.shippingRules.push(rule)
  return clone(rule)
}

const findRule = (id: string) => {
  const rule = db.shippingRules.find((r) => r.id === id && r.brandId === currentBrandId())
  if (!rule) throw new ApiError(404, "Shipping rule not found")
  return rule
}

// PUT /shipping/:id
export async function updateShippingRule(id: string, input: ShippingRuleInput): Promise<ShippingRule> {
  await delay()
  requirePermission("editShipping")
  const rule = findRule(id)
  Object.assign(rule, input, { updatedAt: timestamp() })
  return clone(rule)
}

// DELETE /shipping/:id
export async function deleteShippingRule(id: string): Promise<void> {
  await delay()
  requirePermission("deleteShipping")
  const rule = findRule(id)
  db.shippingRules = db.shippingRules.filter((r) => r.id !== rule.id)
}
