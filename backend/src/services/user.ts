import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { Not } from "typeorm";
import { Brand } from "../entity/Brand";
import { User } from "../entity/User";
import { ChangePasswordInput, CreateUserInput, UpdateMeInput } from "../types/user";
import { AppError } from "../utils/AppError";

// The fields of a user that are safe to send to the client.
const toPublicUser = (user: User) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  brandId: user.brandId,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private brandRepository = AppDataSource.getRepository(Brand);

  async createUser(brandId: string, data: CreateUserInput) {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(409, "A user with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      brandId,
    });

    await this.userRepository.save(user);

    return toPublicUser(user);
  }

  async getUsers(brandId: string) {
    return this.userRepository.find({
      where: { brandId },
      select: ["id", "firstName", "lastName", "email", "role", "brandId", "createdAt", "updatedAt"],
      order: { createdAt: "DESC" },
    });
  }

  // The signed-in user and their brand (null for platform admins), so the
  // dashboard can restore a session from a stored token.
  async getMe(userId: string) {
    const user = await this.findUser(userId);
    const brand = user.brandId
      ? await this.brandRepository.findOne({ where: { id: user.brandId } })
      : null;
    return { user: toPublicUser(user), brand };
  }

  async updateMe(userId: string, data: UpdateMeInput) {
    const user = await this.findUser(userId);

    if (data.email && data.email !== user.email) {
      const taken = await this.userRepository.exists({
        where: { email: data.email, id: Not(userId) },
      });
      if (taken) {
        throw new AppError(409, "Another account already uses this email");
      }
    }

    Object.assign(user, data);
    await this.userRepository.save(user);

    return this.getMe(userId);
  }

  // Wrong current passwords are a 400, not a 401: the session is still valid,
  // and clients treat 401 as "signed out".
  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await this.findUser(userId);

    const matches = await bcrypt.compare(data.currentPassword, user.password);
    if (!matches) {
      throw new AppError(400, "Current password is incorrect");
    }
    if (data.newPassword === data.currentPassword) {
      throw new AppError(400, "New password must be different from the current one");
    }

    user.password = await bcrypt.hash(data.newPassword, 10);
    await this.userRepository.save(user);

    return { message: "Password updated" };
  }

  private async findUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  }
}
