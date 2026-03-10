import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "./Product";

@Entity("product_variants")
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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
