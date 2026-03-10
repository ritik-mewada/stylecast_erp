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
