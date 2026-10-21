/**
 * Creates (or updates) a platform admin account.
 *
 * Platform admins can't register through the API. Run this once per admin:
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npm run create-admin
 *
 * ADMIN_FIRST_NAME / ADMIN_LAST_NAME are optional. Running it again for the
 * same email resets that admin's password and name.
 */
import "reflect-metadata";
import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { UserRole } from "../utils";

const main = async () => {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  await AppDataSource.initialize();
  const users = AppDataSource.getRepository(User);

  const existing = await users.findOne({ where: { email } });
  if (existing && existing.role !== UserRole.PLATFORM_ADMIN) {
    throw new Error(`${email} already belongs to a brand user`);
  }

  const admin = existing ?? users.create({ email });
  admin.firstName = process.env.ADMIN_FIRST_NAME || admin.firstName || "Platform";
  admin.lastName = process.env.ADMIN_LAST_NAME || admin.lastName || "Admin";
  admin.password = await bcrypt.hash(password, 10);
  admin.role = UserRole.PLATFORM_ADMIN;
  admin.brandId = null;
  await users.save(admin);

  console.log(`✅  Platform admin ${existing ? "updated" : "created"}: ${email}`);
};

main()
  .catch((err) => {
    console.error("❌ ", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => AppDataSource.isInitialized && AppDataSource.destroy());
