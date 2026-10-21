import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1792586241894 implements MigrationInterface {
    name = 'InitialSchema1792586241894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // uuid_generate_v4() below comes from this extension.
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('platform_admin', 'brand_owner', 'brand_manager', 'operations_manager')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'brand_owner', "brandId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "variantId" uuid NOT NULL, "quantity" integer NOT NULL DEFAULT '0', "lowStockThreshold" integer NOT NULL DEFAULT '5', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_c543b38cb9c82610bd0848862f" UNIQUE ("variantId"), CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c543b38cb9c82610bd0848862f" ON "inventory" ("variantId") `);
        await queryRunner.query(`CREATE TABLE "product_variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "productId" uuid NOT NULL, "sku" character varying NOT NULL, "size" character varying, "color" character varying, "material" character varying, "priceOverride" numeric(10,2), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_46f236f21640f9da218a063a866" UNIQUE ("sku"), CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_46f236f21640f9da218a063a86" ON "product_variants" ("sku") `);
        await queryRunner.query(`CREATE INDEX "IDX_f515690c571a03400a9876600b" ON "product_variants" ("productId") `);
        await queryRunner.query(`CREATE TABLE "product_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "productId" uuid NOT NULL, "imageUrl" character varying NOT NULL, "altText" character varying, "sortOrder" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."products_status_enum" AS ENUM('active', 'archived')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "category" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "status" "public"."products_status_enum" NOT NULL DEFAULT 'active', "brandId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_45dc45b3961fb2be9a670dd120" ON "products" ("brandId", "category") `);
        await queryRunner.query(`CREATE INDEX "IDX_8356daa5b65a00f60926469dcb" ON "products" ("brandId", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_ea86d0c514c4ecbb5694cbf57d" ON "products" ("brandId") `);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid NOT NULL, "quantity" integer NOT NULL, "price" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_516736b9807228bb17b2d0a3e2" ON "order_items" ("variantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_cdb99c05982d5191ac8465ac01" ON "order_items" ("productId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f1d359a55923bb45b057fbdab0" ON "order_items" ("orderId") `);
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentstatus_enum" AS ENUM('pending', 'paid', 'failed', 'refunded')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_orderstatus_enum" AS ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "brandId" uuid NOT NULL, "customerName" character varying NOT NULL, "customerEmail" character varying NOT NULL, "shippingCountry" character varying NOT NULL, "shippingCity" character varying NOT NULL, "shippingPostalCode" character varying NOT NULL, "shippingAddressLine1" character varying, "shippingAddressLine2" character varying, "shippingStateOrProvince" character varying, "paymentStatus" "public"."orders_paymentstatus_enum" NOT NULL DEFAULT 'pending', "orderStatus" "public"."orders_orderstatus_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c96a5d55fccdd926fb36c3dd4d" ON "orders" ("brandId", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_9cd0871b0a51b396e650e1b200" ON "orders" ("brandId", "orderStatus") `);
        await queryRunner.query(`CREATE INDEX "IDX_b765b286d6bbe79bf706675bd1" ON "orders" ("brandId") `);
        await queryRunner.query(`CREATE TABLE "shipping_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "brandId" uuid NOT NULL, "regionName" character varying NOT NULL, "shippingFee" numeric(10,2) NOT NULL, "freeShippingThreshold" numeric(10,2), "deliveryEstimate" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_07f36b86aaf53d3b1dca7936079" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_87bf48b8abfa162b940da26f9e" ON "shipping_rules" ("brandId") `);
        await queryRunner.query(`CREATE TABLE "traffic_metrics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "brandId" uuid NOT NULL, "metricDate" date NOT NULL, "sessions" integer NOT NULL DEFAULT '0', "ordersPlaced" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_be930d9ad91b7a2a575b0c8687c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c9b151bd9c9e408092e14ea167" ON "traffic_metrics" ("brandId", "metricDate") `);
        await queryRunner.query(`CREATE TYPE "public"."brands_approvalstatus_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "brands" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "companyInfo" text, "website" character varying, "shippingOrigin" character varying, "brandCategory" character varying, "contactEmail" character varying, "contactPhone" character varying, "approvalStatus" "public"."brands_approvalstatus_enum" NOT NULL DEFAULT 'pending', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6" UNIQUE ("name"), CONSTRAINT "UQ_b15428f362be2200922952dc268" UNIQUE ("slug"), CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_b245dea25ee35b6a6e48f1c743a" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_c543b38cb9c82610bd0848862f4" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_images" ADD CONSTRAINT "FK_b367708bf720c8dd62fc6833161" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_ea86d0c514c4ecbb5694cbf57df" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_516736b9807228bb17b2d0a3e2a" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_b765b286d6bbe79bf706675bd14" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipping_rules" ADD CONSTRAINT "FK_87bf48b8abfa162b940da26f9ee" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "traffic_metrics" ADD CONSTRAINT "FK_77f73c3d20257056b2c76f9e6d4" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "traffic_metrics" DROP CONSTRAINT "FK_77f73c3d20257056b2c76f9e6d4"`);
        await queryRunner.query(`ALTER TABLE "shipping_rules" DROP CONSTRAINT "FK_87bf48b8abfa162b940da26f9ee"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_b765b286d6bbe79bf706675bd14"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_516736b9807228bb17b2d0a3e2a"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_ea86d0c514c4ecbb5694cbf57df"`);
        await queryRunner.query(`ALTER TABLE "product_images" DROP CONSTRAINT "FK_b367708bf720c8dd62fc6833161"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_f515690c571a03400a9876600b5"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_c543b38cb9c82610bd0848862f4"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_b245dea25ee35b6a6e48f1c743a"`);
        await queryRunner.query(`DROP TABLE "brands"`);
        await queryRunner.query(`DROP TYPE "public"."brands_approvalstatus_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c9b151bd9c9e408092e14ea167"`);
        await queryRunner.query(`DROP TABLE "traffic_metrics"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_87bf48b8abfa162b940da26f9e"`);
        await queryRunner.query(`DROP TABLE "shipping_rules"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b765b286d6bbe79bf706675bd1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9cd0871b0a51b396e650e1b200"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c96a5d55fccdd926fb36c3dd4d"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_orderstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."orders_paymentstatus_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f1d359a55923bb45b057fbdab0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cdb99c05982d5191ac8465ac01"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_516736b9807228bb17b2d0a3e2"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ea86d0c514c4ecbb5694cbf57d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8356daa5b65a00f60926469dcb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_45dc45b3961fb2be9a670dd120"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
        await queryRunner.query(`DROP TABLE "product_images"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f515690c571a03400a9876600b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_46f236f21640f9da218a063a86"`);
        await queryRunner.query(`DROP TABLE "product_variants"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c543b38cb9c82610bd0848862f"`);
        await queryRunner.query(`DROP TABLE "inventory"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
