// Represents a user account in the system. Brand users belong to a brand and
// have a role (owner, manager, operations) that controls what they're allowed
// to do. Platform admins have no brand (brandId is null). Passwords are stored
// hashed — never in plaintext.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Check,
} from "typeorm";
import { Brand } from "./Brand";
import { UserRole } from "../utils";

// Emails are stored lowercased (see NormalizeEmail), which makes the unique
// email constraint case-insensitive. The check stops any other write path
// from sneaking in a mixed-case duplicate.
@Entity("users")
@Check("CHK_users_email_lowercase", `"email" = lower("email")`)
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

  @Column({ type: "uuid", nullable: true })
  brandId!: string | null;

  // Copied into every JWT. Bumping it (on a password change or reset) makes
  // every token issued before that stop working.
  @Column({ type: "integer", default: 0 })
  tokenVersion!: number;

  @ManyToOne(() => Brand, (brand) => brand.users, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "brandId" })
  brand!: Brand | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
