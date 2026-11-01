import type { ShippingRule } from "@/types/models"
import type { ShippingRuleInput } from "../shipping"
import { http } from "./client"

export async function listShippingRules(): Promise<ShippingRule[]> {
  return (await http.get("/shipping")).data
}

export async function createShippingRule(input: ShippingRuleInput): Promise<ShippingRule> {
  return (await http.post("/shipping", input)).data
}

export async function updateShippingRule(id: string, input: ShippingRuleInput): Promise<ShippingRule> {
  return (await http.put(`/shipping/${id}`, input)).data
}

export async function deleteShippingRule(id: string): Promise<void> {
  await http.delete(`/shipping/${id}`)
}
