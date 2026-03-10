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

  @Column({ type: "decimal", precision: 10, scale: 2 })
  shippingFee!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
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
