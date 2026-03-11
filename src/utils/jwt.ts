/**
 * JWT token generation utility.
 *
 * Creates a signed token containing the minimum payload needed to identify
 * the user across requests without hitting the database.
 */
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../entity/User";
import { Config } from "../config";

export const generateToken = (user: User): string => {
  const options: SignOptions = { expiresIn: Config.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(
    {
      userId: user.id,
      brandId: user.brandId,
      role: user.role,
      email: user.email,
    },
    Config.JWT_SECRET,
    options,
  );
};
