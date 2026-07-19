import { MigrationInterface, QueryRunner } from "typeorm";

export class SettlementV31784464567681 implements MigrationInterface {
    name = 'SettlementV31784464567681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."settlement_type" AS ENUM(
                'city',
                'settlement',
                'village',
                'island',
                'hamlet',
                'other'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "settlement"
            ADD "type" "public"."settlement_type" NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "settlement" DROP COLUMN "type"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."settlement_type"
        `);
    }

}
