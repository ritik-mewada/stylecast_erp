// Type for the order status update request body. Just holds the new status
// value — the valid transitions are enforced in the order service itself.

import { OrderStatus } from "../entity/Order";

export interface UpdateOrderStatusInput {
  orderStatus: OrderStatus;
}
