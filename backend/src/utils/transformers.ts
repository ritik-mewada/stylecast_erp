// Postgres returns numeric/decimal columns as strings so no precision is lost.
// Prices here have two decimals and stay far below 2^53, so they're safe as
// JS numbers; this transformer makes the API return 168 instead of "168.00".

import { ValueTransformer } from "typeorm";

export const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : Number(value),
};
