# Migration `20260723182933_cadu` — incidente

## O que aconteceu

Esta migration foi gerada/aplicada com nome de pessoa (`cadu`) em vez de descrever a mudança de schema. O SQL executado foi:

```sql
ALTER TABLE "audit_log" ALTER COLUMN "id" DROP DEFAULT;
```

Isso **removeu acidentalmente** o `DEFAULT` de `audit_log.id` (esperado: `gen_random_uuid()` ou equivalente). Novos inserts em `audit_log` (via triggers de auditoria) passariam a falhar sem `id` explícito.

## Correção

A migration seguinte restaura o default:

- `20260723183500_restore_audit_log_id_default`

## Por que **não** renomear esta pasta

O nome já está registrado em `_prisma_migrations` em bancos que rodaram `migrate.sh` / `prisma migrate deploy`. Renomear a pasta quebra o histórico e falha o deploy em qualquer ambiente que já aplicou `20260723182933_cadu`.

## Lição

1. Nome de migration Prisma descreve a **mudança de schema** (ex.: `add_pedido_status_index`), **nunca** o nome de quem rodou o comando.
2. Antes de aceitar migration gerada por agente, revisar o SQL e rodar diff (ver regra Migrations em `.cursor/rules/prottus/padroes.mdc`).
