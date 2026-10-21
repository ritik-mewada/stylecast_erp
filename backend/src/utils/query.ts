// Helpers for reading query-string filters. Express gives each value as a
// string, an array (repeated keys) or undefined; these return a clean value
// or undefined, and reject unknown enum values with a 400.

import { AppError } from "./AppError";

export const stringQuery = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

export const enumQuery = <T extends string>(
  value: unknown,
  allowed: Record<string, T>,
  name: string,
): T | undefined => {
  const text = stringQuery(value);
  if (text === undefined) {
    return undefined;
  }
  const values = Object.values(allowed);
  if (!values.includes(text as T)) {
    throw new AppError(400, `${name} must be one of: ${values.join(", ")}`);
  }
  return text as T;
};
