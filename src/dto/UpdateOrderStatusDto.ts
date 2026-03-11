import { IsEnum, IsNotEmpty } from "class-validator";
import { OrderStatus } from "../entity/Order";

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: `orderStatus must be one of: ${Object.values(OrderStatus).join(", ")}`,
  })
  @IsNotEmpty({ message: "orderStatus is required" })
  orderStatus!: OrderStatus;
}
