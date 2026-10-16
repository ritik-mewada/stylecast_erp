// Represents a user account in the system. Every user belongs to a brand and
// has a role (owner, manager, operations) that controls what they're allowed
// to do. Passwords are stored hashed — never in plaintext.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Brand } from "./Brand";
import { UserRole } from "../utils";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.BRAND_OWNER,
  })
  role!: UserRole;

  @Column()
  brandId!: string;

  @ManyToOne(() => Brand, (brand) => brand.users, { onDelete: "CASCADE" })
  @JoinColumn({ name: "brandId" })
  brand!: Brand;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
