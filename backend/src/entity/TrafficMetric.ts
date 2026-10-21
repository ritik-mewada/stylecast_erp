// Stores daily traffic data for a brand — how many sessions happened and how
// many orders were placed that day. This powers the conversion rate analytics.
// Data here is expected to be synced in from an external marketplace or analytics source.

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

@Entity("traffic_metrics")
@Index(["brandId", "metricDate"])
export class TrafficMetric {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  brandId!: string;

  @Column({ type: "date" })
  metricDate!: string;

  @Column({ type: "int", default: 0 })
  sessions!: number;

  @Column({ type: "int", default: 0 })
  ordersPlaced!: number;

  @ManyToOne(() => Brand, (brand) => brand.trafficMetrics, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "brandId" })
  brand!: Brand;

  @CreateDateColumn()
  createdAt!: Date;
}
