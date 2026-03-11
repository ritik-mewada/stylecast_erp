// Loads the .env file and exports the environment variables we care about.
// Any config value the rest of the app needs should come through here rather
// than reading process.env directly all over the place.

import { config } from "dotenv";
config();

const { PORT, NODE_ENV } = process.env;

export const Config = {
  PORT,
  NODE_ENV,
};
