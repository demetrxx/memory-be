import { MigrationInterface, QueryRunner } from 'typeorm';

export class V31784039892116 implements MigrationInterface {
  name = 'V31784039892116';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."product_type_enum" AS ENUM('flower', 'bush', 'tree', 'candle', 'star')
        `);
    await queryRunner.query(`
            CREATE TABLE "product" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "type" "public"."product_type_enum" NOT NULL,
                "price_cents" integer NOT NULL,
                "is_active" boolean NOT NULL,
                "validity_days" integer NOT NULL,
                CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "deceased_item" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "deceased_id" uuid NOT NULL,
                "product_id" uuid NOT NULL,
                "userId" character varying NOT NULL,
                "validUntil" TIMESTAMP,
                CONSTRAINT "PK_00772f909fb08d689756fabf9d8" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_deceased_id" ON "deceased_item" ("deceased_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_product_id" ON "deceased_item" ("product_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "memory_media" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "type" "public"."media_type" NOT NULL,
                "memory_id" uuid,
                "file_id" uuid,
                CONSTRAINT "PK_983c6969f8b85dcdec54d633b0b" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."memory_status_enum" AS ENUM('pending', 'approved', 'rejected')
        `);
    await queryRunner.query(`
            CREATE TABLE "memory" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "text" text NOT NULL,
                "deceased_id" uuid,
                "user_id" uuid,
                "status" "public"."memory_status_enum" NOT NULL,
                CONSTRAINT "PK_719a982d08209b92cd1a0b1c4ec" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "cart_item" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "product_id" uuid NOT NULL,
                CONSTRAINT "PK_bd94725aa84f8cf37632bcde997" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_cart_item_user" ON "cart_item" ("user_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_cart_item_product" ON "cart_item" ("product_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_cart_item_user_product" ON "cart_item" ("user_id", "product_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "deceased_item"
            ADD CONSTRAINT "FK_e47f92328d7a095e08eabb8fd5d" FOREIGN KEY ("deceased_id") REFERENCES "deceased"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "deceased_item"
            ADD CONSTRAINT "FK_691a5f66568e6b84bb807ea7fcd" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "memory_media"
            ADD CONSTRAINT "FK_faaca0fe7014f80294e5f85cea1" FOREIGN KEY ("memory_id") REFERENCES "memory"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "memory_media"
            ADD CONSTRAINT "FK_e97bee9ce9418387ef92bc4932d" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "memory"
            ADD CONSTRAINT "FK_7a3e467427a9c4ffe8a7a619aa7" FOREIGN KEY ("deceased_id") REFERENCES "deceased"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "memory"
            ADD CONSTRAINT "FK_4fcc7f1d5fc0fa98e88dd4567e9" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "cart_item"
            ADD CONSTRAINT "FK_3f1aaffa650d3e443f32459c4c5" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "cart_item"
            ADD CONSTRAINT "FK_67a2e8406e01ffa24ff9026944e" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "cart_item" DROP CONSTRAINT "FK_67a2e8406e01ffa24ff9026944e"
        `);
    await queryRunner.query(`
            ALTER TABLE "cart_item" DROP CONSTRAINT "FK_3f1aaffa650d3e443f32459c4c5"
        `);
    await queryRunner.query(`
            ALTER TABLE "memory" DROP CONSTRAINT "FK_4fcc7f1d5fc0fa98e88dd4567e9"
        `);
    await queryRunner.query(`
            ALTER TABLE "memory" DROP CONSTRAINT "FK_7a3e467427a9c4ffe8a7a619aa7"
        `);
    await queryRunner.query(`
            ALTER TABLE "memory_media" DROP CONSTRAINT "FK_e97bee9ce9418387ef92bc4932d"
        `);
    await queryRunner.query(`
            ALTER TABLE "memory_media" DROP CONSTRAINT "FK_faaca0fe7014f80294e5f85cea1"
        `);
    await queryRunner.query(`
            ALTER TABLE "deceased_item" DROP CONSTRAINT "FK_691a5f66568e6b84bb807ea7fcd"
        `);
    await queryRunner.query(`
            ALTER TABLE "deceased_item" DROP CONSTRAINT "FK_e47f92328d7a095e08eabb8fd5d"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_cart_item_user_product"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_cart_item_product"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_cart_item_user"
        `);
    await queryRunner.query(`
            DROP TABLE "cart_item"
        `);
    await queryRunner.query(`
            DROP TABLE "memory"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."memory_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "memory_media"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_product_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_deceased_id"
        `);
    await queryRunner.query(`
            DROP TABLE "deceased_item"
        `);
    await queryRunner.query(`
            DROP TABLE "product"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."product_type_enum"
        `);
  }
}
