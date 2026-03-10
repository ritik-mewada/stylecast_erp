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
