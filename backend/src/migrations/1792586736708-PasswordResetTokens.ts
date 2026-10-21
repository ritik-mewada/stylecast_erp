import { MigrationInterface, QueryRunner } from "typeorm";

export class PasswordResetTokens1792586736708 implements MigrationInterface {
    name = 'PasswordResetTokens1792586736708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "password_reset_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "tokenHash" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "usedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1143abb8c3fad8b06dd857a8c9c" UNIQUE ("tokenHash"), CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d6a19d4b4f6c62dcd29daa497e" ON "password_reset_tokens" ("userId") `);
        await queryRunner.query(`ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "FK_d6a19d4b4f6c62dcd29daa497e2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_d6a19d4b4f6c62dcd29daa497e2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d6a19d4b4f6c62dcd29daa497e"`);
        await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
    }

}
