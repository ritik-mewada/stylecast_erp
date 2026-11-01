import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { Not } from "typeorm";
import { Brand } from "../entity/Brand";
import { User } from "../entity/User";
import { ChangePasswordInput, CreateUserInput, UpdateMeInput } from "../types/user";
import { AppError } from "../utils/AppError";
import { UserRole } from "../utils";
import { generateToken } from "../utils/jwt";

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

  // Owners manage their team. Neither change can target yourself, so a brand
  // always keeps at least one owner (the one making the change). The auth
  // middleware reads the role from the database, so a new role applies on
  // the member's next request, and a removed member is signed out at once.
  async updateRole(brandId: string, actorId: string, userId: string, role: UserRole) {
    const user = await this.findTeamMember(brandId, actorId, userId, "change your own role");
    user.role = role;
    await this.userRepository.save(user);
    return toPublicUser(user);
  }

  async removeUser(brandId: string, actorId: string, userId: string) {
    const user = await this.findTeamMember(brandId, actorId, userId, "remove yourself");
    await this.userRepository.remove(user);
    return { message: "User removed" };
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
  // A successful change signs out every other session (tokenVersion is
  // bumped) and returns a fresh token so this one carries on.
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
    user.tokenVersion += 1;
    await this.userRepository.save(user);

    return { message: "Password updated", token: generateToken(user) };
  }

  // Another brand's users get the same 404 as missing ones.
  private async findTeamMember(brandId: string, actorId: string, userId: string, action: string) {
    const user = await this.userRepository.findOne({ where: { id: userId, brandId } });
    if (!user) {
      throw new AppError(404, "User not found");
    }
    if (user.id === actorId) {
      throw new AppError(422, `You can't ${action}`);
    }
    return user;
  }

  private async findUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, "User not found");
    }
    return user;
  }
}
