// Sets up the database connection using TypeORM. All the entities (database
// tables) are registered here so TypeORM knows what to manage. This is the
// single place to tweak DB credentials or add new entities as the project grows.

import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { Brand } from "./entity/Brand";
import { User } from "./entity/User";
import { Product } from "./entity/Product";
import { ProductVariant } from "./entity/ProductVariant";
import { ProductImage } from "./entity/ProductImage";
import { Inventory } from "./entity/Inventory";
import { Order } from "./entity/Order";
import { OrderItem } from "./entity/OrderItem";
import { ShippingRule } from "./entity/ShippingRule";
import { TrafficMetric } from "./entity/TrafficMatric";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "stylecast_erp",
  synchronize: true,
  logging: false,
  entities: [
    Brand,
    User,
    Product,
    ProductVariant,
    ProductImage,
    Inventory,
    Order,
    OrderItem,
    ShippingRule,
    TrafficMetric,
  ],
  migrations: [],
  subscribers: [],
});

