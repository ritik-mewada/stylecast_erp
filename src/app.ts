import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import brandRoutes from "./routes/brand";
import productRoutes from "./routes/product";
import inventoryRoutes from "./routes/inventory";
import orderRoutes from "./routes/order";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/brands", brandRoutes);
app.use("/products", productRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the StyleCast ERP API");
});

export default app;
