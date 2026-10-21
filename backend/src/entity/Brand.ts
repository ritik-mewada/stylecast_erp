// The Brand entity represents a store on the platform. It holds all the brand's
// profile info (name, slug, contact details, category) and links to its users,
// products, orders, shipping rules, and traffic metrics.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Check,
  Index,
} from "typeorm";
import { User } from "./User";
import { Product } from "./Product";
import { Order } from "./Order";
import { ShippingRule } from "./ShippingRule";
import { TrafficMetric } from "./TrafficMetric";

export enum BrandApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

// Slugs are stored lowercase, so the unique slug constraint is effectively
// case-insensitive. Names keep their display case but must be unique
// ignoring case: UQ_brands_name_lower is a unique index on lower(name),
// created by a migration (TypeORM can't model expression indexes, hence
// synchronize: false so it isn't dropped).
@Entity("brands")
@Check("CHK_brands_slug_lowercase", `"slug" = lower("slug")`)
@Index("UQ_brands_name_lower", { synchronize: false })
export class Brand {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: "text", nullable: true })
  companyInfo!: string;

  @Column({ nullable: true })
  website!: string;

  @Column({ nullable: true })
  shippingOrigin!: string;

  @Column({ nullable: true })
  brandCategory!: string;

  @Column({ nullable: true })
  contactEmail!: string;

  @Column({ nullable: true })
  contactPhone!: string;

  @Column({
    type: "enum",
    enum: BrandApprovalStatus,
    default: BrandApprovalStatus.PENDING,
  })
  approvalStatus!: BrandApprovalStatus;

  // False while the brand is rejected; set by the platform admin's approval
  // decision, never by the brand itself.
  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => User, (user) => user.brand)
  users!: User[];

  @OneToMany(() => Product, (product) => product.brand)
  products!: Product[];

  @OneToMany(() => Order, (order) => order.brand)
  orders!: Order[];

  @OneToMany(() => ShippingRule, (rule) => rule.brand)
  shippingRules!: ShippingRule[];

  @OneToMany(() => TrafficMetric, (metric) => metric.brand)
  trafficMetrics!: TrafficMetric[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
