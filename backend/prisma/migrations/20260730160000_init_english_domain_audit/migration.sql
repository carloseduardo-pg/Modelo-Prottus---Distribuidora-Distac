-- Distac / Prottus base — clean English domain + audit + integrity triggers
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "clients" (
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
CREATE UNIQUE INDEX "clients_document_key" ON "clients"("document");

CREATE TABLE "products" (
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
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

CREATE TABLE "orders" (
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
CREATE UNIQUE INDEX "orders_number_key" ON "orders"("number");
CREATE INDEX "orders_client_id_idx" ON "orders"("client_id");
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX "orders_status_idx" ON "orders"("status");

CREATE TABLE "order_items" (
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
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

CREATE TABLE "audit_log" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tabela" TEXT NOT NULL,
  "registro_id" TEXT,
  "operacao" TEXT NOT NULL CHECK ("operacao" IN ('INSERT', 'UPDATE', 'DELETE')),
  "dados_antes" JSONB,
  "dados_depois" JSONB,
  "usuario_db" TEXT NOT NULL DEFAULT CURRENT_USER,
  "app_usuario" TEXT,
  "criado_em" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);
CREATE INDEX "audit_log_tabela_criado_idx" ON "audit_log" ("tabela", "criado_em" DESC);
CREATE INDEX "audit_log_registro_idx" ON "audit_log" ("registro_id");

CREATE OR REPLACE FUNCTION fn_audit_row()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id TEXT;
  v_app TEXT;
  v_antes JSONB;
  v_depois JSONB;
BEGIN
  BEGIN
    v_app := NULLIF(current_setting('app.user_id', true), '');
  EXCEPTION WHEN OTHERS THEN
    v_app := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    v_id := NEW.id::text;
    v_depois := to_jsonb(NEW) - 'password_hash';
    INSERT INTO audit_log (tabela, registro_id, operacao, dados_antes, dados_depois, app_usuario)
    VALUES (TG_TABLE_NAME, v_id, TG_OP, NULL, v_depois, v_app);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    v_id := NEW.id::text;
    v_antes := to_jsonb(OLD) - 'password_hash';
    v_depois := to_jsonb(NEW) - 'password_hash';
    INSERT INTO audit_log (tabela, registro_id, operacao, dados_antes, dados_depois, app_usuario)
    VALUES (TG_TABLE_NAME, v_id, TG_OP, v_antes, v_depois, v_app);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    v_id := OLD.id::text;
    v_antes := to_jsonb(OLD) - 'password_hash';
    INSERT INTO audit_log (tabela, registro_id, operacao, dados_antes, dados_depois, app_usuario)
    VALUES (TG_TABLE_NAME, v_id, TG_OP, v_antes, NULL, v_app);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_order_item_before()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_status "OrderStatus";
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    SELECT status INTO v_status FROM "orders" WHERE id = NEW.order_id;
    IF v_status IS NULL THEN
      RAISE EXCEPTION 'Integrity: order % does not exist', NEW.order_id
        USING ERRCODE = 'foreign_key_violation';
    END IF;
    IF v_status = 'CANCELLED' THEN
      RAISE EXCEPTION 'Integrity: cancelled order does not accept item changes'
        USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.quantity IS NULL OR NEW.quantity <= 0 THEN
      RAISE EXCEPTION 'Integrity: item quantity must be > 0'
        USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.unit_price IS NULL OR NEW.unit_price < 0 THEN
      RAISE EXCEPTION 'Integrity: unit price cannot be negative'
        USING ERRCODE = 'check_violation';
    END IF;
    NEW.line_total := ROUND(NEW.quantity * NEW.unit_price, 2);
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    SELECT status INTO v_status FROM "orders" WHERE id = OLD.order_id;
    IF v_status = 'CANCELLED' THEN
      RAISE EXCEPTION 'Integrity: cancelled order does not accept item deletion'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
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

CREATE TRIGGER trg_users_bu_updated BEFORE UPDATE ON "users"
  FOR EACH ROW EXECUTE PROCEDURE fn_set_updated_at();
CREATE TRIGGER trg_clients_bu_updated BEFORE UPDATE ON "clients"
  FOR EACH ROW EXECUTE PROCEDURE fn_set_updated_at();
CREATE TRIGGER trg_products_bu_updated BEFORE UPDATE ON "products"
  FOR EACH ROW EXECUTE PROCEDURE fn_set_updated_at();
CREATE TRIGGER trg_orders_bu_updated BEFORE UPDATE ON "orders"
  FOR EACH ROW EXECUTE PROCEDURE fn_set_updated_at();

CREATE TRIGGER trg_order_items_biud_calculate
  BEFORE INSERT OR UPDATE OR DELETE ON "order_items"
  FOR EACH ROW EXECUTE PROCEDURE fn_order_item_before();

CREATE TRIGGER trg_order_items_aiud_total
  AFTER INSERT OR UPDATE OR DELETE ON "order_items"
  FOR EACH ROW EXECUTE PROCEDURE fn_order_recalc_total();

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
