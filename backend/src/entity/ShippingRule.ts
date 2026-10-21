// Defines a shipping rule for a specific region. Each brand can have multiple
// rules covering different areas — with a flat shipping fee, an optional free
// shipping threshold, and an estimated delivery window.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { decimalTransformer } from "../utils/transformers";
import { Brand } from "./Brand";

@Entity("shipping_rules")
@Index(["brandId"])
export class ShippingRule {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  brandId!: string;

  @Column()
  regionName!: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  shippingFee!: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  freeShippingThreshold!: number;

  @Column()
  deliveryEstimate!: string;

  @ManyToOne(() => Brand, { onDelete: "CASCADE" })
  @JoinColumn({ name: "brandId" })
  brand!: Brand;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
