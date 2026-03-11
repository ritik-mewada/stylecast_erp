// The Product entity is the core of the catalog. Each product belongs to a brand
// and can have multiple variants (sizes, colors, etc.) and images. Products can
// be either active or archived — we soft-delete rather than hard-delete.

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
import { ProductVariant } from "./ProductVariant";
import { ProductImage } from "./ProductImage";

export enum ProductStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
}

@Entity("products")
@Index(["brandId"])
@Index(["brandId", "status"])
@Index(["brandId", "category"])
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column()
  category!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({
    type: "enum",
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status!: ProductStatus;

  @Column()
  brandId!: string;

  @ManyToOne(() => Brand, (brand) => brand.products, { onDelete: "CASCADE" })
  @JoinColumn({ name: "brandId" })
  brand!: Brand;

  @OneToMany(() => ProductVariant, (variant) => variant.product)
  variants!: ProductVariant[];

  @OneToMany(() => ProductImage, (image) => image.product)
  images!: ProductImage[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
