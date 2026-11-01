/**
 * JWT token generation utility.
 *
 * The token identifies the user and carries their tokenVersion. The auth
 * middleware loads the user on every request and rejects the token once the
 * version has moved on, so role, brand and email always come from the
 * database, never from the token.
 */
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../entity/User";
import { Config } from "../config";

export interface TokenPayload {
  userId: string;
  tokenVersion?: number; // missing in tokens issued before versions existed
}

export const generateToken = (user: Pick<User, "id" | "tokenVersion">): string => {
  const options: SignOptions = { expiresIn: Config.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  const payload: TokenPayload = { userId: user.id, tokenVersion: user.tokenVersion };
  return jwt.sign(payload, Config.JWT_SECRET, options);
};
