// An uploaded image (product photos). The bytes live in Postgres so uploads
// survive redeploys on hosts with ephemeral disks, without needing a separate
// object store; images are capped at 5 MB. `data` is excluded from normal
// selects so listing uploads never loads the file contents.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Brand } from "./Brand";

@Entity("uploads")
@Index(["brandId"])
export class Upload {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  brandId!: string;

  @Column()
  contentType!: string;

  @Column({ type: "int" })
  size!: number;

  @Column({ type: "bytea", select: false })
  data!: Buffer;

  @ManyToOne(() => Brand, { onDelete: "CASCADE" })
  @JoinColumn({ name: "brandId" })
  brand!: Brand;

  @CreateDateColumn()
  createdAt!: Date;
}
