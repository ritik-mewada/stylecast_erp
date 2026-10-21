import { MigrationInterface, QueryRunner } from "typeorm";

export class LowercaseUserEmails1792588334690 implements MigrationInterface {
    name = 'LowercaseUserEmails1792588334690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Accounts that differ only by case would collide once lowercased.
        // Merging them automatically could lose data, so stop and let a person decide.
        const clashes: { email: string }[] = await queryRunner.query(
            `SELECT lower("email") AS email FROM "users" GROUP BY lower("email") HAVING count(*) > 1`,
        );
        if (clashes.length > 0) {
            throw new Error(
                `These emails belong to more than one account when case is ignored: ${clashes.map((c) => c.email).join(", ")}. ` +
                    "Rename or remove the extra accounts, then run the migrations again.",
            );
        }
        await queryRunner.query(`UPDATE "users" SET "email" = lower("email") WHERE "email" <> lower("email")`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_users_email_lowercase" CHECK ("email" = lower("email"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_users_email_lowercase"`);
    }

}
