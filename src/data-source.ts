import "reflect-metadata";
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
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "root",
  database: "stylecast_erp",
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
