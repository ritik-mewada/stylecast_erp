import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "./Product";

@Entity("product_images")
export class ProductImage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  productId!: string;

  @Column()
  imageUrl!: string;

  @Column({ nullable: true })
  altText!: string;

  @Column({ default: 0 })
  sortOrder!: number;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "productId" })
  product!: Product;

  @CreateDateColumn()
  createdAt!: Date;
}
