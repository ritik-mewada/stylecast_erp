import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { CreateUserInput } from "../types/user";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async createUser(brandId: string, data: CreateUserInput) {
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
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

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
  }

  async getUsers(brandId: string) {
    return this.userRepository.find({
      where: { brandId },
      select: ["id", "firstName", "lastName", "email", "role", "createdAt"],
      order: { createdAt: "DESC" },
    });
  }
}
