import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1783779477742 implements MigrationInterface {
  name = 'Init1783779477742';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."file_status_enum" AS ENUM('PENDING', 'UPLOADED')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."file_dir_enum" AS ENUM('public', 'private')
        `);
    await queryRunner.query(`
            CREATE TABLE "file" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "status" "public"."file_status_enum" NOT NULL DEFAULT 'UPLOADED',
                "path" character varying NOT NULL,
                "url" character varying,
                "name" character varying NOT NULL,
                "mime" character varying NOT NULL,
                "dir" "public"."file_dir_enum" NOT NULL,
                CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id")
            );
            COMMENT ON COLUMN "file"."status" IS 'Whether the file is pending upload or already uploaded';
            COMMENT ON COLUMN "file"."path" IS 'Path in S3 "<dirName>/<fileId>", e.g. /files/1234567890';
            COMMENT ON COLUMN "file"."url" IS 'Public URL of the file';
            COMMENT ON COLUMN "file"."name" IS 'Original file name';
            COMMENT ON COLUMN "file"."mime" IS 'MIME type of the file';
            COMMENT ON COLUMN "file"."dir" IS 'Directory in S3 where the file is stored'
        `);
    await queryRunner.query(`
            COMMENT ON TABLE "file" IS 'File stored in S3'
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."plan_type" AS ENUM('subscription', 'service')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."plan_period" AS ENUM('month', 'quarter', 'year')
        `);
    await queryRunner.query(`
            CREATE TABLE "plan" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "type" "public"."plan_type" NOT NULL,
                "period" "public"."plan_period",
                "amount_cents" integer NOT NULL,
                "monthly_price_cents" integer,
                "discount" integer,
                "is_active" boolean NOT NULL,
                CONSTRAINT "PK_54a2b686aed3b637654bf7ddbb3" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_plan_period_is_active" ON "plan" ("period", "is_active")
            WHERE is_active = true
                AND period IS NOT NULL
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."notification_type" AS ENUM('system', 'promo')
        `);
    await queryRunner.query(`
            CREATE TABLE "notification" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "type" "public"."notification_type" NOT NULL,
                "payload" json NOT NULL DEFAULT '{}',
                "user_id" uuid NOT NULL,
                "is_read" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_notification_user" ON "notification" ("user_id")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."invoice_status_enum" AS ENUM('pending', 'paid', 'failed')
        `);
    await queryRunner.query(`
            CREATE TABLE "invoice" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "status" "public"."invoice_status_enum" NOT NULL DEFAULT 'pending',
                "amount_cents" integer NOT NULL,
                "plan_id" uuid NOT NULL,
                "user_id" uuid,
                CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_invoice__plan" ON "invoice" ("plan_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_invoice__user" ON "invoice" ("user_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "payment" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "userId" character varying(255) NOT NULL,
                "invoice_id" uuid NOT NULL,
                "amountCents" integer NOT NULL,
                "plan_id" uuid NOT NULL,
                "user_id" uuid,
                CONSTRAINT "REL_20cc84d8a2274ae86f551360c1" UNIQUE ("invoice_id"),
                CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_b046318e0b341a7f72110b7585" ON "payment" ("userId")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_payment_plan" ON "payment" ("plan_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "refresh_web_session" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "token_hash" character varying(255) NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "revoked_at" TIMESTAMP,
                "replaced_by_id" uuid,
                "user_agent" character varying(255),
                "ip" character varying(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_35d0f2f933061ddf959cb40dab4" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_refresh_web_session_token_hash" ON "refresh_web_session" ("token_hash")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_refresh_web_session_expires" ON "refresh_web_session" ("expires_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_refresh_web_session_user_web" ON "refresh_web_session" ("user_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "subscription" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "period" "public"."plan_period" NOT NULL,
                "end_date" TIMESTAMP NOT NULL,
                "user_id" uuid NOT NULL,
                "recharge" boolean NOT NULL DEFAULT true,
                CONSTRAINT "REL_940d49a105d50bbd616be54001" UNIQUE ("user_id"),
                CONSTRAINT "PK_8c3e00ebd02103caa1174cd5d9d" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'inactive', 'blocked')
        `);
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "firstName" character varying(255),
                "lastName" character varying(255),
                "username" character varying(255),
                "is_anonymous" boolean NOT NULL DEFAULT false,
                "status" "public"."user_status_enum" NOT NULL DEFAULT 'active',
                "email" character varying(255),
                "passwordHash" character varying(255),
                "google_sub" character varying(255),
                "last_activity_at" TIMESTAMP NOT NULL DEFAULT NOW(),
                "anonymous_data" json,
                "notify_email" boolean NOT NULL DEFAULT true,
                CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_user_google_sub" ON "user" ("google_sub")
            WHERE "google_sub" IS NOT NULL
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."activity_log_type" AS ENUM(
                'open',
                'signup',
                'update_profile',
                'create_memory',
                'edit_memory',
                'delete_memory',
                'create_deceased',
                'edit_deceased',
                'delete_deceased',
                'add_product',
                'create_invoice',
                'pay_invoice'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "activity_log" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "type" "public"."activity_log_type" NOT NULL,
                "payload" jsonb,
                "user_id" uuid NOT NULL,
                CONSTRAINT "PK_067d761e2956b77b14e534fd6f1" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_log_user_id" ON "activity_log" ("user_id")
        `);
    await queryRunner.query(`
            CREATE TABLE "refresh_session" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "admin_id" uuid NOT NULL,
                "token_hash" character varying(255) NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "revoked_at" TIMESTAMP,
                "replaced_by_id" uuid,
                "user_agent" character varying(255),
                "ip" character varying(255),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_5d0d8c21064803b5b2baaa50cbb" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_refresh_session_token_hash" ON "refresh_session" ("token_hash")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_refresh_session_expires" ON "refresh_session" ("expires_at")
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_refresh_session_admin" ON "refresh_session" ("admin_id")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."admin_role_enum" AS ENUM('owner', 'developer', 'support')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."admin_status_enum" AS ENUM('active', 'inactive')
        `);
    await queryRunner.query(`
            CREATE TABLE "admin" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "firstName" character varying(255),
                "lastName" character varying(255),
                "role" "public"."admin_role_enum" NOT NULL DEFAULT 'developer',
                "email" character varying(255) NOT NULL,
                "status" "public"."admin_status_enum" NOT NULL DEFAULT 'active',
                "passwordHash" character varying(255),
                "invited_by_id" uuid,
                CONSTRAINT "UQ_de87485f6489f5d0995f5841952" UNIQUE ("email"),
                CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_admin_invited_by" ON "admin" ("invited_by_id")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."otp_purpose" AS ENUM('verify_email', 'reset_password')
        `);
    await queryRunner.query(`
            CREATE TABLE "otp" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "code" character varying(6) NOT NULL,
                "purpose" "public"."otp_purpose" NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "activated_at" TIMESTAMP,
                "user_id" uuid NOT NULL,
                "payload" jsonb NOT NULL,
                "userId" uuid,
                CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "idx_otp_user_id" ON "otp" ("user_id")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_otp_user_purpose_id" ON "otp" ("user_id", "code", "purpose")
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."settlement_other_country_enum" AS ENUM('russia')
        `);
    await queryRunner.query(`
            CREATE TABLE "settlement" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "name" character varying(255) NOT NULL,
                "region" character varying(255),
                "other_country" "public"."settlement_other_country_enum",
                CONSTRAINT "PK_23997ae6972574beb45af0177ad" PRIMARY KEY ("id")
            )
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
            CREATE TYPE "public"."military_unit_branches_enum" AS ENUM(
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
            CREATE TABLE "military_unit" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "name" character varying(255) NOT NULL,
                "type" "public"."military_unit_type_enum" NOT NULL,
                "branches" "public"."military_unit_branches_enum" array NOT NULL,
                CONSTRAINT "PK_3fc155a161890d1eedde99435dd" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."status" AS ENUM('pending', 'approved', 'rejected')
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."gender" AS ENUM('male', 'female')
        `);
    await queryRunner.query(`
            CREATE TABLE "deceased" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "status" "public"."status" NOT NULL,
                "slug" character varying(255) NOT NULL,
                "firstName" character varying(255) NOT NULL,
                "lastName" character varying(255) NOT NULL,
                "fatherName" character varying(255) NOT NULL,
                "gender" "public"."gender" NOT NULL,
                "dob" date NOT NULL,
                "dod" date NOT NULL,
                "life_role" character varying(255) NOT NULL,
                "birth_place_id" uuid,
                "death_place_id" uuid,
                "avatar_id" uuid,
                "bio" text,
                "call_sign" character varying(255),
                "death_cause" character varying(255) NOT NULL,
                "death_military_unit_id" uuid,
                "created_by_id" uuid,
                CONSTRAINT "UQ_78e478f456bb7a35e139397c34a" UNIQUE ("slug"),
                CONSTRAINT "REL_78204e01db77b0f7780e56b8e1" UNIQUE ("avatar_id"),
                CONSTRAINT "PK_d21a1fbc3aac9affa45b657a572" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."system_log_status" AS ENUM('success', 'error')
        `);
    await queryRunner.query(`
            CREATE TABLE "system_log" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "message" character varying,
                "type" character varying NOT NULL,
                "level" character varying NOT NULL,
                "payload" json,
                "stack_trace" text,
                "status" "public"."system_log_status" NOT NULL,
                CONSTRAINT "PK_fa0b9c6bd88ab76873fcf09f3a5" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "notification"
            ADD CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "invoice"
            ADD CONSTRAINT "FK_35a92148c37c87fe61559a239a2" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "invoice"
            ADD CONSTRAINT "FK_c14b00795593eafc9d423e7f74d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "payment"
            ADD CONSTRAINT "FK_c66c60a17b56ec882fcd8ec770b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "payment"
            ADD CONSTRAINT "FK_20cc84d8a2274ae86f551360c11" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "payment"
            ADD CONSTRAINT "FK_db12dcbce4ef547fa9879a0aca0" FOREIGN KEY ("plan_id") REFERENCES "plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_web_session"
            ADD CONSTRAINT "FK_b997eb0c8cc74c9e998889af63f" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "subscription"
            ADD CONSTRAINT "FK_940d49a105d50bbd616be540013" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "activity_log"
            ADD CONSTRAINT "FK_81615294532ca4b6c70abd1b2e6" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_session"
            ADD CONSTRAINT "FK_984a1ac2224d7970a47e3d7b159" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "admin"
            ADD CONSTRAINT "FK_c8cc3d1ebdd25e6fd5c2697ca3a" FOREIGN KEY ("invited_by_id") REFERENCES "admin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "otp"
            ADD CONSTRAINT "FK_db724db1bc3d94ad5ba38518433" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "deceased"
            ADD CONSTRAINT "FK_1644dcc1a4d9e7562a913925392" FOREIGN KEY ("birth_place_id") REFERENCES "settlement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "deceased"
            ADD CONSTRAINT "FK_2b28cf67350b27d6081266ef068" FOREIGN KEY ("death_place_id") REFERENCES "settlement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "deceased"
            ADD CONSTRAINT "FK_78204e01db77b0f7780e56b8e17" FOREIGN KEY ("avatar_id") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "deceased"
            ADD CONSTRAINT "FK_7d9b50fd4ff833c31f29f8f0678" FOREIGN KEY ("death_military_unit_id") REFERENCES "military_unit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "deceased"
            ADD CONSTRAINT "FK_88114379ece394b001517651071" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "deceased" DROP CONSTRAINT "FK_88114379ece394b001517651071"
        `);
    await queryRunner.query(`
            ALTER TABLE "deceased" DROP CONSTRAINT "FK_7d9b50fd4ff833c31f29f8f0678"
        `);
    await queryRunner.query(`
            ALTER TABLE "deceased" DROP CONSTRAINT "FK_78204e01db77b0f7780e56b8e17"
        `);
    await queryRunner.query(`
            ALTER TABLE "deceased" DROP CONSTRAINT "FK_2b28cf67350b27d6081266ef068"
        `);
    await queryRunner.query(`
            ALTER TABLE "deceased" DROP CONSTRAINT "FK_1644dcc1a4d9e7562a913925392"
        `);
    await queryRunner.query(`
            ALTER TABLE "otp" DROP CONSTRAINT "FK_db724db1bc3d94ad5ba38518433"
        `);
    await queryRunner.query(`
            ALTER TABLE "admin" DROP CONSTRAINT "FK_c8cc3d1ebdd25e6fd5c2697ca3a"
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_session" DROP CONSTRAINT "FK_984a1ac2224d7970a47e3d7b159"
        `);
    await queryRunner.query(`
            ALTER TABLE "activity_log" DROP CONSTRAINT "FK_81615294532ca4b6c70abd1b2e6"
        `);
    await queryRunner.query(`
            ALTER TABLE "subscription" DROP CONSTRAINT "FK_940d49a105d50bbd616be540013"
        `);
    await queryRunner.query(`
            ALTER TABLE "refresh_web_session" DROP CONSTRAINT "FK_b997eb0c8cc74c9e998889af63f"
        `);
    await queryRunner.query(`
            ALTER TABLE "payment" DROP CONSTRAINT "FK_db12dcbce4ef547fa9879a0aca0"
        `);
    await queryRunner.query(`
            ALTER TABLE "payment" DROP CONSTRAINT "FK_20cc84d8a2274ae86f551360c11"
        `);
    await queryRunner.query(`
            ALTER TABLE "payment" DROP CONSTRAINT "FK_c66c60a17b56ec882fcd8ec770b"
        `);
    await queryRunner.query(`
            ALTER TABLE "invoice" DROP CONSTRAINT "FK_c14b00795593eafc9d423e7f74d"
        `);
    await queryRunner.query(`
            ALTER TABLE "invoice" DROP CONSTRAINT "FK_35a92148c37c87fe61559a239a2"
        `);
    await queryRunner.query(`
            ALTER TABLE "notification" DROP CONSTRAINT "FK_928b7aa1754e08e1ed7052cb9d8"
        `);
    await queryRunner.query(`
            DROP TABLE "system_log"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."system_log_status"
        `);
    await queryRunner.query(`
            DROP TABLE "deceased"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."gender"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."status"
        `);
    await queryRunner.query(`
            DROP TABLE "military_unit"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."military_unit_branches_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."military_unit_type_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "settlement"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."settlement_other_country_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_otp_user_purpose_id"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_otp_user_id"
        `);
    await queryRunner.query(`
            DROP TABLE "otp"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."otp_purpose"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_admin_invited_by"
        `);
    await queryRunner.query(`
            DROP TABLE "admin"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."admin_status_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."admin_role_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_refresh_session_admin"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_refresh_session_expires"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_refresh_session_token_hash"
        `);
    await queryRunner.query(`
            DROP TABLE "refresh_session"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_log_user_id"
        `);
    await queryRunner.query(`
            DROP TABLE "activity_log"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."activity_log_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_user_google_sub"
        `);
    await queryRunner.query(`
            DROP TABLE "user"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."user_status_enum"
        `);
    await queryRunner.query(`
            DROP TABLE "subscription"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_refresh_web_session_user_web"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_refresh_web_session_expires"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_refresh_web_session_token_hash"
        `);
    await queryRunner.query(`
            DROP TABLE "refresh_web_session"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_payment_plan"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_b046318e0b341a7f72110b7585"
        `);
    await queryRunner.query(`
            DROP TABLE "payment"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_invoice__user"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_invoice__plan"
        `);
    await queryRunner.query(`
            DROP TABLE "invoice"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."invoice_status_enum"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_notification_user"
        `);
    await queryRunner.query(`
            DROP TABLE "notification"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."notification_type"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."idx_plan_period_is_active"
        `);
    await queryRunner.query(`
            DROP TABLE "plan"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."plan_period"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."plan_type"
        `);
    await queryRunner.query(`
            COMMENT ON TABLE "file" IS NULL
        `);
    await queryRunner.query(`
            DROP TABLE "file"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."file_dir_enum"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."file_status_enum"
        `);
  }
}
