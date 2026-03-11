// A small helper that generates a signed JWT for a user. The token includes
// the user's ID, their brand ID, role, and email — everything the API needs
// to identify who's making a request without hitting the database each time.
// Tokens expire after 1 day.

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
