import jwt from "jsonwebtoken";
import { User } from "../entity/User";

export const generateToken = (user: User) => {
  return jwt.sign(
    {
      userId: user.id,
      brandId: user.brandId,
      role: user.role,
      email: user.email,
    },
    String(process.env.JWT_SECRET),
    { expiresIn: "1d" },
  );
};
