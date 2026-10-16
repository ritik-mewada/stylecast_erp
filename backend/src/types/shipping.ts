// Input types for shipping rule operations. The create type requires the core
// fields while the update type makes everything optional so you can patch
// individual fields without having to resend the whole rule.

export interface CreateShippingRuleInput {
  regionName: string;
  shippingFee: number;
  freeShippingThreshold?: number;
  deliveryEstimate: string;
}

export interface UpdateShippingRuleInput {
  regionName?: string;
  shippingFee?: number;
  freeShippingThreshold?: number;
  deliveryEstimate?: string;
}
