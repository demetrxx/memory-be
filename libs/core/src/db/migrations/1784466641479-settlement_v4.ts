import { MigrationInterface, QueryRunner } from "typeorm";

export class SettlementV41784466641479 implements MigrationInterface {
    name = 'SettlementV41784466641479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "settlement"
            ADD "lat" double precision NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "settlement"
            ADD "lng" double precision NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "settlement" DROP COLUMN "lng"
        `);
        await queryRunner.query(`
            ALTER TABLE "settlement" DROP COLUMN "lat"
        `);
    }

}
