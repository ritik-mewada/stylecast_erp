import app from "./app";
import { Config } from "./config";
import { AppDataSource } from "./data-source";

const startServer = async () => {
  const PORT = Config.PORT;
  try {
    await AppDataSource.initialize();
    console.log("Database connection successfully.");
    app.listen(PORT, () => console.log(`listening on PORT ${PORT}`));
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }
};

void startServer();
