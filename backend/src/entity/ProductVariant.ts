// A product variant is a specific version of a product — different size, color,
// or material. Each variant has its own unique SKU and can optionally override
// the base product price. It also links to its own inventory record.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToOne,
} from "typeorm";
import { Product } from "./Product";
import { Inventory } from "./Inventory";

@Entity("product_variants")
@Index(["productId"])
@Index(["sku"], { unique: true })
export class ProductVariant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  productId!: string;

  @Column({ unique: true })
  sku!: string;

  @Column({ nullable: true })
  size!: string;

  @Column({ nullable: true })
  color!: string;

  @Column({ nullable: true })
  material!: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  priceOverride!: number;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @OneToOne(() => Inventory, (inventory) => inventory.variant)
  inventory!: Inventory;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
