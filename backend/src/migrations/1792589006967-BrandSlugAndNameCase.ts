import { MigrationInterface, QueryRunner } from "typeorm";

export class BrandSlugAndNameCase1792589006967 implements MigrationInterface {
    name = 'BrandSlugAndNameCase1792589006967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Brands whose slug or name differ only by case would collide. Renaming
        // a live brand is a business decision, so stop and list them instead.
        const clashes: { kind: string; value: string }[] = await queryRunner.query(
            `SELECT 'slug' AS kind, lower("slug") AS value FROM "brands" GROUP BY lower("slug") HAVING count(*) > 1
             UNION ALL
             SELECT 'name' AS kind, lower("name") AS value FROM "brands" GROUP BY lower("name") HAVING count(*) > 1`,
        );
        if (clashes.length > 0) {
            throw new Error(
                `These brand ${clashes.map((c) => `${c.kind}s "${c.value}"`).join(", ")} are used by more than one brand when case is ignored. ` +
                    "Rename the extra brands, then run the migrations again.",
            );
        }
        await queryRunner.query(`UPDATE "brands" SET "slug" = lower("slug") WHERE "slug" <> lower("slug")`);
        await queryRunner.query(`ALTER TABLE "brands" ADD CONSTRAINT "CHK_brands_slug_lowercase" CHECK ("slug" = lower("slug"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_brands_name_lower" ON "brands" (lower("name"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_brands_name_lower"`);
        await queryRunner.query(`ALTER TABLE "brands" DROP CONSTRAINT "CHK_brands_slug_lowercase"`);
    }

}
