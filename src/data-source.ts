import "reflect-metadata";
import { DataSource } from "typeorm";
import { Brand } from "./entity/Brand";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "root",
  database: "stylecast_erp",
  synchronize: true,
  logging: false,
  entities: [Brand],
  migrations: [],
  subscribers: [],
});
