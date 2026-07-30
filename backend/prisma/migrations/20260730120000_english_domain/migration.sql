-- English domain tables for the Nest API.
-- Existing Portuguese tables remain untouched; reset local development databases
-- to remove the obsolete schema and apply this model cleanly.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

CREATE TABLE IF NOT EXISTS "clients" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "document" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "city" TEXT,
  "state" VARCHAR(2),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "clients_document_key" ON "clients"("document");

CREATE TABLE IF NOT EXISTS "products" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "sku" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "price" DECIMAL(12,2) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "products_sku_key" ON "products"("sku");

CREATE TABLE IF NOT EXISTS "orders" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "number" TEXT NOT NULL,
  "client_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
  "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "ordered_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "orders_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id"),
  CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "orders_number_key" ON "orders"("number");
CREATE INDEX IF NOT EXISTS "orders_client_id_idx" ON "orders"("client_id");
CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders"("status");

CREATE TABLE IF NOT EXISTS "order_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL,
  "product_id" UUID NOT NULL,
  "quantity" DECIMAL(12,3) NOT NULL,
  "unit_price" DECIMAL(12,2) NOT NULL,
  "line_total" DECIMAL(14,2) NOT NULL,
  CONSTRAINT "order_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE,
  CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id")
);
CREATE INDEX IF NOT EXISTS "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX IF NOT EXISTS "order_items_product_id_idx" ON "order_items"("product_id");

CREATE OR REPLACE FUNCTION fn_order_item_before()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.quantity <= 0 OR NEW.unit_price < 0 THEN
    RAISE EXCEPTION 'Order item quantity must be positive and price non-negative'
      USING ERRCODE = 'check_violation';
  END IF;
  NEW.line_total := ROUND(NEW.quantity * NEW.unit_price, 2);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_order_recalc_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  v_order_id := COALESCE(NEW.order_id, OLD.order_id);
  UPDATE "orders"
  SET "total" = COALESCE((
    SELECT ROUND(SUM("line_total"), 2)
    FROM "order_items"
    WHERE "order_id" = v_order_id
  ), 0)
  WHERE "id" = v_order_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_order_items_biu_calculate ON "order_items";
CREATE TRIGGER trg_order_items_biu_calculate
  BEFORE INSERT OR UPDATE ON "order_items"
  FOR EACH ROW EXECUTE PROCEDURE fn_order_item_before();

DROP TRIGGER IF EXISTS trg_order_items_aiud_total ON "order_items";
CREATE TRIGGER trg_order_items_aiud_total
  AFTER INSERT OR UPDATE OR DELETE ON "order_items"
  FOR EACH ROW EXECUTE PROCEDURE fn_order_recalc_total();

-- Reuse the local audit and updated_at functions installed by earlier migrations.
CREATE TRIGGER trg_users_bu_updated BEFORE UPDATE ON "users"
  FOR EACH ROW EXECUTE PROCEDURE fn_set_updated_at();
CREATE TRIGGER trg_clients_bu_updated BEFORE UPDATE ON "clients"
  FOR EACH ROW EXECUTE PROCEDURE fn_set_updated_at();
CREATE TRIGGER trg_products_bu_updated BEFORE UPDATE ON "products"
  FOR EACH ROW EXECUTE PROCEDURE fn_set_updated_at();
CREATE TRIGGER trg_orders_bu_updated BEFORE UPDATE ON "orders"
  FOR EACH ROW EXECUTE PROCEDURE fn_set_updated_at();

CREATE TRIGGER trg_users_aiud_audit AFTER INSERT OR UPDATE OR DELETE ON "users"
  FOR EACH ROW EXECUTE PROCEDURE fn_audit_row();
CREATE TRIGGER trg_clients_aiud_audit AFTER INSERT OR UPDATE OR DELETE ON "clients"
  FOR EACH ROW EXECUTE PROCEDURE fn_audit_row();
CREATE TRIGGER trg_products_aiud_audit AFTER INSERT OR UPDATE OR DELETE ON "products"
  FOR EACH ROW EXECUTE PROCEDURE fn_audit_row();
CREATE TRIGGER trg_orders_aiud_audit AFTER INSERT OR UPDATE OR DELETE ON "orders"
  FOR EACH ROW EXECUTE PROCEDURE fn_audit_row();
CREATE TRIGGER trg_order_items_aiud_audit AFTER INSERT OR UPDATE OR DELETE ON "order_items"
  FOR EACH ROW EXECUTE PROCEDURE fn_audit_row();
