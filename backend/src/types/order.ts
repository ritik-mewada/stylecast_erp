// Types for order inputs. Creating an order takes the customer and shipping
// details plus a list of variant/quantity lines; the price of each line is
// taken from the catalog, never from the request. The status update body just
// holds the new status — valid transitions are enforced in the order service.

import { OrderStatus, PaymentStatus } from "../entity/Order";

export interface CreateOrderItemInput {
  variantId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  shippingCountry: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingStateOrProvince?: string;
  items: CreateOrderItemInput[];
}

export interface UpdateOrderStatusInput {
  orderStatus: OrderStatus;
}

export interface OrderListFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
}
