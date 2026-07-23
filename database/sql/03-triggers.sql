-- =============================================================================
-- Distac / Prottus — Triggers PostgreSQL (padrão empresa)
-- Referência conceitual: Alura — "O que é e como usar Trigger em SQL"
--   • Integridade de dados (BEFORE / row-level)
--   • Cascata de consistência (AFTER / row-level)
--   • Auditoria DML (AFTER INSERT|UPDATE|DELETE)
-- Idempotente: pode reaplicar com segurança.
-- =============================================================================

-- Extensão para UUID (PostgreSQL 13+ já tem gen_random_uuid nativo)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 1) Tabela de auditoria (genérica — padrão para futuros projetos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tabela        TEXT NOT NULL,
  registro_id   TEXT,
  operacao      TEXT NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
  dados_antes   JSONB,
  dados_depois  JSONB,
  usuario_db    TEXT NOT NULL DEFAULT CURRENT_USER,
  app_usuario   TEXT, -- opcional: set_config('app.user_id', ..., true) na sessão
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garante DEFAULT mesmo se a tabela já existia sem ele (ex.: drift Prisma)
ALTER TABLE audit_log
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

CREATE INDEX IF NOT EXISTS audit_log_tabela_criado_idx
  ON audit_log (tabela, criado_em DESC);

CREATE INDEX IF NOT EXISTS audit_log_registro_idx
  ON audit_log (registro_id);

COMMENT ON TABLE audit_log IS
  'Auditoria DML Distac/Prottus — preenchida só por triggers (não pela API).';

-- -----------------------------------------------------------------------------
-- 2) Função genérica de auditoria (row-level)
-- -----------------------------------------------------------------------------
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

COMMENT ON FUNCTION fn_audit_row() IS
  'Trigger AFTER DML — grava INSERT/UPDATE/DELETE em audit_log com JSON antes/depois.';

-- -----------------------------------------------------------------------------
-- 3) Integridade: updated_at automático (BEFORE UPDATE)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 4) Integridade pedido_item: validar + calcular subtotal (BEFORE)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_pedido_item_before()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_status "PedidoStatus";
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    SELECT status INTO v_status FROM pedido WHERE id = NEW.pedido_id;
    IF v_status IS NULL THEN
      RAISE EXCEPTION 'Integridade: pedido % não existe', NEW.pedido_id
        USING ERRCODE = 'foreign_key_violation';
    END IF;
    IF v_status = 'cancelado' THEN
      RAISE EXCEPTION 'Integridade: pedido cancelado não aceita alteração de itens'
        USING ERRCODE = 'check_violation';
    END IF;

    IF NEW.quantidade IS NULL OR NEW.quantidade <= 0 THEN
      RAISE EXCEPTION 'Integridade: quantidade do item deve ser > 0'
        USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.preco_unitario IS NULL OR NEW.preco_unitario < 0 THEN
      RAISE EXCEPTION 'Integridade: preço unitário não pode ser negativo'
        USING ERRCODE = 'check_violation';
    END IF;

    -- Cascata de cálculo: subtotal sempre derivado (fonte da verdade no banco)
    NEW.subtotal := ROUND(NEW.quantidade * NEW.preco_unitario, 2);
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    SELECT status INTO v_status FROM pedido WHERE id = OLD.pedido_id;
    IF v_status = 'cancelado' THEN
      RAISE EXCEPTION 'Integridade: pedido cancelado não aceita exclusão de itens'
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- -----------------------------------------------------------------------------
-- 5) Cascata: recalcular total do pedido (AFTER item)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_pedido_recalc_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_pedido_id TEXT;
BEGIN
  v_pedido_id := COALESCE(NEW.pedido_id, OLD.pedido_id);

  UPDATE pedido
  SET
    total = COALESCE((
      SELECT ROUND(SUM(subtotal), 2)
      FROM pedido_item
      WHERE pedido_id = v_pedido_id
    ), 0),
    updated_at = NOW()
  WHERE id = v_pedido_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

COMMENT ON FUNCTION fn_pedido_recalc_total() IS
  'Após INSERT/UPDATE/DELETE em pedido_item, atualiza pedido.total (cascata).';

-- -----------------------------------------------------------------------------
-- 6) Integridade pedido: bloquear edição de cancelado (BEFORE UPDATE)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_pedido_before_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_ativo BOOLEAN;
BEGIN
  IF OLD.status = 'cancelado' AND NEW.status = 'cancelado' THEN
    IF NEW.cliente_id IS DISTINCT FROM OLD.cliente_id
       OR NEW.observacao IS DISTINCT FROM OLD.observacao
       OR NEW.data IS DISTINCT FROM OLD.data THEN
      RAISE EXCEPTION 'Integridade: pedido cancelado não pode ser editado'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  IF OLD.status = 'cancelado' AND NEW.status IS DISTINCT FROM 'cancelado' THEN
    RAISE EXCEPTION 'Integridade: pedido cancelado não pode mudar de status'
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.cliente_id IS DISTINCT FROM OLD.cliente_id THEN
    SELECT ativo INTO v_ativo FROM cliente WHERE id = NEW.cliente_id;
    IF v_ativo IS NULL THEN
      RAISE EXCEPTION 'Integridade: cliente % não existe', NEW.cliente_id;
    END IF;
    IF v_ativo IS NOT TRUE THEN
      RAISE EXCEPTION 'Integridade: cliente inativo não pode receber pedido';
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 7) Integridade: pedido só para cliente ativo (BEFORE INSERT/UPDATE)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_pedido_before_write()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_ativo BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.cliente_id IS DISTINCT FROM OLD.cliente_id) THEN
    SELECT ativo INTO v_ativo FROM cliente WHERE id = NEW.cliente_id;
    IF v_ativo IS NULL THEN
      RAISE EXCEPTION 'Integridade: cliente % não existe', NEW.cliente_id;
    END IF;
    IF v_ativo IS NOT TRUE THEN
      RAISE EXCEPTION 'Integridade: cliente inativo não pode receber pedido';
    END IF;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.updated_at := COALESCE(NEW.updated_at, NOW());
  END IF;

  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 8) Drop triggers antigos (idempotência) e recria
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tgname, relname
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND NOT t.tgisinternal
      AND (
        tgname LIKE 'trg\_%' ESCAPE '\'
      )
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', r.tgname, r.relname);
  END LOOP;
END $$;

-- updated_at
CREATE TRIGGER trg_cliente_bu_updated
  BEFORE UPDATE ON cliente
  FOR EACH ROW EXECUTE PROCEDURE fn_set_updated_at();

CREATE TRIGGER trg_produto_bu_updated
  BEFORE UPDATE ON produto
  FOR EACH ROW EXECUTE PROCEDURE fn_set_updated_at();

CREATE TRIGGER trg_user_bu_updated
  BEFORE UPDATE ON "user"
  FOR EACH ROW EXECUTE PROCEDURE fn_set_updated_at();

-- pedido write + update rules
CREATE TRIGGER trg_pedido_bi_integridade
  BEFORE INSERT ON pedido
  FOR EACH ROW EXECUTE PROCEDURE fn_pedido_before_write();

CREATE TRIGGER trg_pedido_bu_integridade
  BEFORE UPDATE ON pedido
  FOR EACH ROW EXECUTE PROCEDURE fn_pedido_before_update();

-- pedido_item calc + validação
CREATE TRIGGER trg_pedido_item_biud_calc
  BEFORE INSERT OR UPDATE OR DELETE ON pedido_item
  FOR EACH ROW EXECUTE PROCEDURE fn_pedido_item_before();

-- cascata total
CREATE TRIGGER trg_pedido_item_aiud_total
  AFTER INSERT OR UPDATE OR DELETE ON pedido_item
  FOR EACH ROW EXECUTE PROCEDURE fn_pedido_recalc_total();

-- auditoria domínio + auth
CREATE TRIGGER trg_cliente_aiud_audit
  AFTER INSERT OR UPDATE OR DELETE ON cliente
  FOR EACH ROW EXECUTE PROCEDURE fn_audit_row();

CREATE TRIGGER trg_produto_aiud_audit
  AFTER INSERT OR UPDATE OR DELETE ON produto
  FOR EACH ROW EXECUTE PROCEDURE fn_audit_row();

CREATE TRIGGER trg_pedido_aiud_audit
  AFTER INSERT OR UPDATE OR DELETE ON pedido
  FOR EACH ROW EXECUTE PROCEDURE fn_audit_row();

CREATE TRIGGER trg_pedido_item_aiud_audit
  AFTER INSERT OR UPDATE OR DELETE ON pedido_item
  FOR EACH ROW EXECUTE PROCEDURE fn_audit_row();

CREATE TRIGGER trg_user_aiud_audit
  AFTER INSERT OR UPDATE OR DELETE ON "user"
  FOR EACH ROW EXECUTE PROCEDURE fn_audit_row();
