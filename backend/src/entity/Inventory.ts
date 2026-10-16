// Tracks stock levels for each product variant. Has a one-to-one relationship
// with ProductVariant, and keeps a low stock threshold so the system can flag
// items that are running out before they hit zero.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { ProductVariant } from "./ProductVariant";

@Entity("inventory")
@Index(["variantId"], { unique: true })
export class Inventory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  variantId!: string;

  @Column({ type: "int", default: 0 })
  quantity!: number;

  @Column({ type: "int", default: 5 })
  lowStockThreshold!: number;

  @OneToOne(() => ProductVariant, { onDelete: "CASCADE" })
  @JoinColumn({ name: "variantId" })
  variant!: ProductVariant;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
