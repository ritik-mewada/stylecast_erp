import { MigrationInterface, QueryRunner } from "typeorm";

// users.tokenVersion: bumped on a password change or reset to end every
// session signed in before it. Existing users start at 0, which is also what
// tokens issued before this column existed are treated as.
export class UserTokenVersion1793562804545 implements MigrationInterface {
    name = 'UserTokenVersion1793562804545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "tokenVersion" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tokenVersion"`);
    }

}
