import { MigrationInterface, QueryRunner } from "typeorm";

export class V11784038874826 implements MigrationInterface {
    name = 'V11784038874826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."media_type" AS ENUM('image', 'video')
        `);
        await queryRunner.query(`
            CREATE TABLE "deceased_media" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "deceased_id" uuid NOT NULL,
                "type" "public"."media_type" NOT NULL,
                "file_id" uuid NOT NULL,
                CONSTRAINT "PK_7c6b36f18d81c79942098963b38" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "idx_deceased_media_deceased_id" ON "deceased_media" ("deceased_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit" DROP COLUMN "type"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."military_unit_type_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit" DROP COLUMN "name"
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit"
            ADD "names" jsonb NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit"
            ADD "is_separate" boolean NOT NULL DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit"
            ADD "is_presidential" boolean NOT NULL DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit"
            ADD "number" integer NOT NULL
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."military_unit_echelon_enum" AS ENUM(
                'command',
                'corps',
                'brigade',
                'regiment',
                'battalion',
                'company',
                'platoon',
                'detachment',
                'center',
                'other',
                'unknown'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit"
            ADD "echelon" "public"."military_unit_echelon_enum" NOT NULL
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."military_unit_specialization_enum" AS ENUM(
                'mechanized',
                'motorized_infantry',
                'infantry',
                'assault',
                'mountain_assault',
                'air_assault',
                'airborne',
                'airmobile',
                'tank',
                'artillery',
                'marine',
                'special_purpose',
                'operational_purpose',
                'territorial_defense',
                'other',
                'unknown'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit"
            ADD "specialization" "public"."military_unit_specialization_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "deceased"
            ADD "life_photo_id" uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "deceased"
            ADD CONSTRAINT "UQ_8b74bab14ce9a87aaf14d49f934" UNIQUE ("life_photo_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."deceased_military_role_enum" AS ENUM(
                'reporter',
                'soldier',
                'officer',
                'pilot',
                'mechanic',
                'medic',
                'other'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "deceased"
            ADD "military_role" "public"."deceased_military_role_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "deceased"
            ADD "created_by_relation" character varying(255)
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_5438a380670df13de8139b26aa" ON "military_unit" ("echelon", "number")
        `);
        await queryRunner.query(`
            ALTER TABLE "deceased_media"
            ADD CONSTRAINT "FK_927f839da57d3506f43ac9c53ff" FOREIGN KEY ("deceased_id") REFERENCES "deceased"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "deceased_media"
            ADD CONSTRAINT "FK_5295eff3cbed4d9c3e4fb5066b1" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "deceased"
            ADD CONSTRAINT "FK_8b74bab14ce9a87aaf14d49f934" FOREIGN KEY ("life_photo_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "deceased" DROP CONSTRAINT "FK_8b74bab14ce9a87aaf14d49f934"
        `);
        await queryRunner.query(`
            ALTER TABLE "deceased_media" DROP CONSTRAINT "FK_5295eff3cbed4d9c3e4fb5066b1"
        `);
        await queryRunner.query(`
            ALTER TABLE "deceased_media" DROP CONSTRAINT "FK_927f839da57d3506f43ac9c53ff"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5438a380670df13de8139b26aa"
        `);
        await queryRunner.query(`
            ALTER TABLE "deceased" DROP COLUMN "created_by_relation"
        `);
        await queryRunner.query(`
            ALTER TABLE "deceased" DROP COLUMN "military_role"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."deceased_military_role_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "deceased" DROP CONSTRAINT "UQ_8b74bab14ce9a87aaf14d49f934"
        `);
        await queryRunner.query(`
            ALTER TABLE "deceased" DROP COLUMN "life_photo_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit" DROP COLUMN "specialization"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."military_unit_specialization_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit" DROP COLUMN "echelon"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."military_unit_echelon_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit" DROP COLUMN "number"
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit" DROP COLUMN "is_presidential"
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit" DROP COLUMN "is_separate"
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit" DROP COLUMN "names"
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit"
            ADD "name" character varying(255) NOT NULL
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."military_unit_type_enum" AS ENUM(
                'command',
                'corps',
                'brigade',
                'regiment',
                'battalion',
                'company',
                'platoon',
                'detachment',
                'center',
                'other',
                'unknown'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "military_unit"
            ADD "type" "public"."military_unit_type_enum" NOT NULL
        `);
        await queryRunner.query(`
            DROP INDEX "public"."idx_deceased_media_deceased_id"
        `);
        await queryRunner.query(`
            DROP TABLE "deceased_media"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."media_type"
        `);
    }

}
