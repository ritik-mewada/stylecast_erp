/**
 * TypeORM data source configuration.
 *
 * - synchronize is off everywhere: the schema is managed by migrations in
 *   src/migrations. After changing an entity, run
 *   `npm run migration:generate -- src/migrations/<Name>`, read the SQL, then
 *   `npm run migration:run`.
 * - The migrations glob resolves next to this file, so it finds the .ts files
 *   under src (ts-node) and the compiled .js files under dist (production).
 * - All connection values come from the validated Config object.
 * - Logging is limited to errors only to reduce noise.
 */
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from "./config";
import { Brand } from "./entity/Brand";
import { User } from "./entity/User";
import { PasswordResetToken } from "./entity/PasswordResetToken";
import { Product } from "./entity/Product";
import { ProductVariant } from "./entity/ProductVariant";
import { ProductImage } from "./entity/ProductImage";
import { Inventory } from "./entity/Inventory";
import { Order } from "./entity/Order";
import { OrderItem } from "./entity/OrderItem";
import { ShippingRule } from "./entity/ShippingRule";
import { TrafficMetric } from "./entity/TrafficMetric";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Config.DB_HOST,
  port: Config.DB_PORT,
  username: Config.DB_USERNAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
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
    PasswordResetToken,
  ],
  migrations: [__dirname + "/migrations/*.{ts,js}"],
  subscribers: [],
});
