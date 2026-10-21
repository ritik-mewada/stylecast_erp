import { MigrationInterface, QueryRunner } from "typeorm";

export class TrafficMetricOnePerDay1792586941849 implements MigrationInterface {
    name = 'TrafficMetricOnePerDay1792586941849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Keep only the newest row per brand per day so the unique index can be built.
        await queryRunner.query(`DELETE FROM "traffic_metrics" t USING "traffic_metrics" newer WHERE t."brandId" = newer."brandId" AND t."metricDate" = newer."metricDate" AND (t."createdAt", t."id") < (newer."createdAt", newer."id")`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c9b151bd9c9e408092e14ea167"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c9b151bd9c9e408092e14ea167" ON "traffic_metrics" ("brandId", "metricDate") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c9b151bd9c9e408092e14ea167"`);
        await queryRunner.query(`CREATE INDEX "IDX_c9b151bd9c9e408092e14ea167" ON "traffic_metrics" ("brandId", "metricDate") `);
    }

}
