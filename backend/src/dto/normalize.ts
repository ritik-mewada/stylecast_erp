// Input normalisation applied while a request body is turned into its DTO,
// before validation runs. Non-strings pass through untouched and fail
// validation as usual.

import { Transform } from "class-transformer";
import { Matches, MaxLength, MinLength } from "class-validator";

const trimmed = (lowercase: boolean) =>
  Transform(({ value }) => {
    if (typeof value !== "string") return value;
    const text = value.trim();
    return lowercase ? text.toLowerCase() : text;
  });

// Account emails are stored lowercased and trimmed, so sign-up, sign-in,
// invites and password resets treat "Camille@Example.com " and
// "camille@example.com" as the same account.
export const NormalizeEmail = () => trimmed(true);

// Surrounding spaces would let "Maison Ondine " slip past the unique name check.
export const Trim = () => trimmed(false);

// Brand slugs appear in URLs: trimmed and lowercased, then limited to
// lowercase letters, digits and single hyphens ("maison-ondine").
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const NormalizeSlug = (field: string): PropertyDecorator => {
  const decorators = [
    trimmed(true),
    MinLength(2, { message: `${field} must be at least 2 characters` }),
    MaxLength(60, { message: `${field} must be at most 60 characters` }),
    Matches(SLUG_PATTERN, {
      message: `${field} can only use lowercase letters, numbers and single hyphens (e.g. maison-ondine)`,
    }),
  ];
  return (target, key) => decorators.forEach((decorate) => decorate(target, key));
};
