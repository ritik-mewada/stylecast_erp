// Represents a single line item within an order — which product/variant was
// ordered, how many, and at what price. One order can have multiple items
// and each item points back to the specific variant that was purchased.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Order } from "./Order";
import { Product } from "./Product";
import { ProductVariant } from "./ProductVariant";

@Entity("order_items")
@Index(["orderId"])
@Index(["productId"])
@Index(["variantId"])
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  orderId!: string;

  @Column()
  productId!: string;

  @Column()
  variantId!: string;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order!: Order;

  @ManyToOne(() => Product, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @ManyToOne(() => ProductVariant, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "variantId" })
  variant!: ProductVariant;

  @CreateDateColumn()
  createdAt!: Date;
}
