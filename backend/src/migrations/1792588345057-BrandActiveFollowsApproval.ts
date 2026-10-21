import { MigrationInterface, QueryRunner } from "typeorm";

// Data only: brands.isActive now follows the admin's approval decision
// (false while rejected). Bring existing rows in line with that rule.
export class BrandActiveFollowsApproval1792588345057 implements MigrationInterface {
    name = 'BrandActiveFollowsApproval1792588345057'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE "brands" SET "isActive" = ("approvalStatus" <> 'rejected') WHERE "isActive" <> ("approvalStatus" <> 'rejected')`);
    }

    public async down(): Promise<void> {
        // Nothing to undo: the previous values were never meaningful.
    }

}
