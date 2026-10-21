// Input normalisation applied while a request body is turned into its DTO,
// before validation runs.

import { Transform } from "class-transformer";

// Account emails are stored lowercased and trimmed, so sign-up, sign-in,
// invites and password resets treat "Camille@Example.com " and
// "camille@example.com" as the same account. Non-strings pass through
// untouched and fail validation as usual.
export const NormalizeEmail = () =>
  Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value));
