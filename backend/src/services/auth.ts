import crypto from "crypto";
import bcrypt from "bcrypt";
import { IsNull } from "typeorm";
import { Config } from "../config";
import { AppDataSource } from "../data-source";
import { generateToken } from "../utils/jwt";
import { Brand } from "../entity/Brand";
import { User } from "../entity/User";
import { PasswordResetToken } from "../entity/PasswordResetToken";
import { LoginInput, RegisterInput, ResetPasswordInput } from "../types/auth";
import { UserRole } from "../utils";
import { AppError } from "../utils/AppError";
import { sendMail } from "../utils/mailer";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// Checked against when an email has no account, so an unknown email takes as
// long as a wrong password and response times don't reveal which emails exist.
const DUMMY_PASSWORD_HASH = bcrypt.hash("no-such-account", 10);

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export class AuthService {
  private brandRepository = AppDataSource.getRepository(Brand);
  private userRepository = AppDataSource.getRepository(User);
  private resetTokenRepository = AppDataSource.getRepository(PasswordResetToken);

  async register(data: RegisterInput) {
    // Slugs are already lowercase; names are unique regardless of case.
    const existingBrand = await this.brandRepository
      .createQueryBuilder("brand")
      .where("LOWER(brand.name) = LOWER(:name)", { name: data.brandName })
      .orWhere("brand.slug = :slug", { slug: data.brandSlug })
      .getExists();

    if (existingBrand) {
      throw new AppError(409, "A brand with this name or slug already exists");
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(409, "A user with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Brand and owner are created together, or not at all.
    const { brand, user } = await AppDataSource.transaction(async (m) => {
      const brand = m.create(Brand, {
        name: data.brandName,
        slug: data.brandSlug,
        companyInfo: data.companyInfo || "",
        website: data.website || "",
        shippingOrigin: data.shippingOrigin || "",
        brandCategory: data.brandCategory || "",
        contactEmail: data.contactEmail || "",
        contactPhone: data.contactPhone || "",
        isActive: true,
      });
      await m.save(brand);

      const user = m.create(User, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        role: UserRole.BRAND_OWNER,
        brandId: brand.id,
      });
      await m.save(user);

      return { brand, user };
    });

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

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user?.password ?? (await DUMMY_PASSWORD_HASH),
    );

    if (!user || !isPasswordValid) {
      throw new AppError(401, "Invalid email or password");
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

  // Emails a single-use reset link if the email belongs to an account. The
  // caller always gets the same response either way, so this can't be used
  // to find out which emails are registered. A new request replaces any
  // earlier unused link.
  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return;
    }

    const token = crypto.randomBytes(32).toString("base64url");

    await this.resetTokenRepository.delete({ userId: user.id, usedAt: IsNull() });
    await this.resetTokenRepository.save(
      this.resetTokenRepository.create({
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      }),
    );

    const link = `${Config.APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
    await sendMail({
      to: user.email,
      subject: "Reset your StyleCast password",
      text: [
        `Hi ${user.firstName},`,
        "",
        "Someone (hopefully you) asked to reset the password for your StyleCast account.",
        `Choose a new password here: ${link}`,
        "",
        "The link expires in 1 hour and works once. If you didn't ask for this, you can ignore this email.",
      ].join("\n"),
    });
  }

  // Redeems a reset link. The token row is locked so the same link can't be
  // used twice at once; every other open link for the user stops working too.
  async resetPassword(data: ResetPasswordInput) {
    const password = await bcrypt.hash(data.newPassword, 10);

    await AppDataSource.transaction(async (m) => {
      const record = await m.findOne(PasswordResetToken, {
        where: { tokenHash: hashToken(data.token) },
        lock: { mode: "pessimistic_write" },
      });

      if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
        throw new AppError(400, "This reset link is invalid or has expired");
      }

      await m.update(User, { id: record.userId }, { password });
      record.usedAt = new Date();
      await m.save(record);
      await m.delete(PasswordResetToken, { userId: record.userId, usedAt: IsNull() });
    });

    return { message: "Password updated. You can now sign in." };
  }
}
