import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1765541160110 implements MigrationInterface {
  name = 'Migrations1765541160110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.sql`
    CREATE EXTENSION IF NOT EXISTS vector;
    `;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.sql`
    DROP EXTENSION IF EXISTS vector;
    `;
  }
}
