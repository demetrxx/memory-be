import { MigrationInterface, QueryRunner } from "typeorm";

export class SettlementV21784463222047 implements MigrationInterface {
    name = 'SettlementV21784463222047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "settlement"
            ADD "aliases" character varying(255) array NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "settlement" DROP COLUMN "region"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."region" AS ENUM(
                'kharkiv',
                'kyiv',
                'lviv',
                'odesa',
                'zaporizhzhia',
                'zhytomyr',
                'ivano-frankivsk',
                'kirovohrad',
                'lutsk',
                'kherson',
                'khmelnytskyi',
                'cherkasy',
                'chernivtsi',
                'chernihiv',
                'dnipropetrovsk',
                'donetsk',
                'luhansk',
                'mykolaiv',
                'rivne',
                'sumy',
                'ternopil',
                'vinnytsia',
                'poltava',
                'uzhhorod',
                'crimea'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "settlement"
            ADD "region" "public"."region" NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "settlement" DROP COLUMN "region"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."region"
        `);
        await queryRunner.query(`
            ALTER TABLE "settlement"
            ADD "region" character varying(255)
        `);
        await queryRunner.query(`
            ALTER TABLE "settlement" DROP COLUMN "aliases"
        `);
    }

}
