import type { ShippingRule } from "@/types/models"
import type * as Impl from "./http/shipping"
import { DEMO_MODE, lazyApi } from "./mode"

export type ShippingRuleInput = Pick<
  ShippingRule,
  "regionName" | "shippingFee" | "freeShippingThreshold" | "deliveryEstimate"
>

const api = lazyApi((): Promise<typeof Impl> => (DEMO_MODE ? import("./mock/shipping") : import("./http/shipping")))

export const listShippingRules = api("listShippingRules")
export const createShippingRule = api("createShippingRule")
export const updateShippingRule = api("updateShippingRule")
export const deleteShippingRule = api("deleteShippingRule")
