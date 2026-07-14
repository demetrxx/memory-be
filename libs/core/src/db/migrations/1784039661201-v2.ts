import { MigrationInterface, QueryRunner } from 'typeorm';

export class V21784039661201 implements MigrationInterface {
  name = 'V21784039661201';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "military_unit"
                RENAME COLUMN "branches" TO "branch"
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."military_unit_branches_enum"
            RENAME TO "military_unit_branch_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "military_unit" DROP COLUMN "branch"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."military_unit_branch" AS ENUM(
                'armed_forces',
                'national_guard',
                'border_guard',
                'national_police',
                'security_service',
                'intelligence',
                'territorial_defense',
                'other'
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "military_unit"
            ADD "branch" "public"."military_unit_branch" NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "military_unit" DROP COLUMN "branch"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."military_unit_branch"
        `);
    await queryRunner.query(`
            ALTER TABLE "military_unit"
            ADD "branch" "public"."military_unit_branch_enum" array NOT NULL
        `);
    await queryRunner.query(`
            ALTER TYPE "public"."military_unit_branch_enum"
            RENAME TO "military_unit_branches_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "military_unit"
                RENAME COLUMN "branch" TO "branches"
        `);
  }
}
