/**
 * TypeORM data source configuration.
 *
 * - synchronize is intentionally set to false for production safety.
 *   Use `npm run migration:generate` and `npm run migration:run` to manage schema.
 * - All connection values come from the validated Config object.
 * - Logging is limited to errors only to reduce noise.
 */
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from "./config";
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
  host: Config.DB_HOST,
  port: Config.DB_PORT,
  username: Config.DB_USERNAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
  // ⚠️  synchronize is DISABLED — run migrations to keep the schema up-to-date.
  //     Set to true ONLY in a local sandbox environment and never in production.
  synchronize: false,
  logging: ["error"],
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
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});
