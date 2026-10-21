import { MigrationInterface, QueryRunner } from "typeorm";

export class Uploads1792586842789 implements MigrationInterface {
    name = 'Uploads1792586842789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "uploads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "brandId" uuid NOT NULL, "contentType" character varying NOT NULL, "size" integer NOT NULL, "data" bytea NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d1781d1eedd7459314f60f39bd3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f2327b95de0ff6a5df34315588" ON "uploads" ("brandId") `);
        await queryRunner.query(`ALTER TABLE "uploads" ADD CONSTRAINT "FK_f2327b95de0ff6a5df34315588f" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "uploads" DROP CONSTRAINT "FK_f2327b95de0ff6a5df34315588f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f2327b95de0ff6a5df34315588"`);
        await queryRunner.query(`DROP TABLE "uploads"`);
    }

}
