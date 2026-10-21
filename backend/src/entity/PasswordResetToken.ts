// A single-use password reset link. Only a SHA-256 hash of the token is
// stored, so a leaked database row can't be used to reset a password. Tokens
// expire after an hour and are marked used once redeemed.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";

@Entity("password_reset_tokens")
@Index(["userId"])
export class PasswordResetToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ unique: true })
  tokenHash!: string;

  @Column({ type: "timestamptz" })
  expiresAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  usedAt!: Date | null;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
