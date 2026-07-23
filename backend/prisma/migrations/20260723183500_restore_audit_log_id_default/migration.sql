-- Restaura DEFAULT de audit_log.id (removido por drift acidental em 20260723182933_cadu).
-- Necessário: triggers de auditoria inserem sem informar id.
ALTER TABLE "audit_log"
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
