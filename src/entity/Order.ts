import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from "typeorm";
import { Brand } from "./Brand";
import { OrderItem } from "./OrderItem";

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

@Entity("orders")
@Index(["brandId"])
@Index(["brandId", "orderStatus"])
@Index(["brandId", "createdAt"])
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  brandId!: string;

  @Column()
  customerName!: string;

  @Column()
  customerEmail!: string;

  @Column()
  shippingCountry!: string;

  @Column()
  shippingCity!: string;

  @Column()
  shippingPostalCode!: string;

  @Column({ nullable: true })
  shippingAddressLine1!: string;

  @Column({ nullable: true })
  shippingAddressLine2!: string;

  @Column({ nullable: true })
  shippingStateOrProvince!: string;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus!: PaymentStatus;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  orderStatus!: OrderStatus;

  @ManyToOne(() => Brand, (brand) => brand.orders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "brandId" })
  brand!: Brand;

  @OneToMany(() => OrderItem, (item) => item.order)
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
