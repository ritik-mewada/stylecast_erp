import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { generateToken } from "../utils/jwt";
import { Brand } from "../entity/Brand";
import { User } from "../entity/User";
import { LoginInput, RegisterInput } from "../types/auth";
import { UserRole } from "../utils";

export class AuthService {
  private brandRepository = AppDataSource.getRepository(Brand);
  private userRepository = AppDataSource.getRepository(User);

  async register(data: RegisterInput) {
    const existingBrand = await this.brandRepository.findOne({
      where: [{ name: data.brandName }, { slug: data.brandSlug }],
    });

    if (existingBrand) {
      throw new Error("Brand already exists");
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const brand = this.brandRepository.create({
      name: data.brandName,
      slug: data.brandSlug,
      isActive: true,
    });

    await this.brandRepository.save(brand);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = this.userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      role: data.role || UserRole.BRAND_OWNER,
      brandId: brand.id,
    });

    await this.userRepository.save(user);

    const token = generateToken(user);

    return {
      message: "Brand and user registered successfully",
      brand,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        brandId: user.brandId,
      },
      token,
    };
  }

  async login(data: LoginInput) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
      relations: ["brand"],
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const token = generateToken(user);

    return {
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        brandId: user.brandId,
      },
      token,
    };
  }
}
