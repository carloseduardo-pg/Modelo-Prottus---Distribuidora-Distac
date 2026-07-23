# Triggers — Distac

Conceito: gatilhos DML para integridade, cascata e auditoria ([Alura — Trigger em SQL](https://www.alura.com.br/artigos/trigger-em-sql)).  
Implementação neste projeto: **PostgreSQL**, row-level, BEFORE/AFTER.

| Artefato | Caminho |
|----------|---------|
| Script canônico | [`../sql/03-triggers.sql`](../sql/03-triggers.sql) |
| Migration | `backend/prisma/migrations/20260723181500_triggers_audit_integrity/` |
| Segurança (omitir sensíveis) | [`../../docs/projeto/seguranca.md`](../../docs/projeto/seguranca.md) |

Este SQL **faz parte da base Distac/Prottus** — ao partir deste repo para outro cliente, adapte tabelas/regras e mantenha `audit_log` + omissão de hashes/segredos.

---

## Objetivos

| Objetivo | Aplicação Distac |
|----------|------------------|
| Integridade | BEFORE: quantidade, preço, cliente ativo, pedido cancelado |
| Cascata | AFTER `pedido_item` → `pedido.total` |
| Auditoria | AFTER DML → `audit_log` (JSON; **sem** `password_hash`) |
| Automação | `updated_at`, `subtotal` |

API valida para UX; o banco é a segunda linha de defesa.

---

## `audit_log`

| Coluna | Uso |
|--------|-----|
| `tabela` / `registro_id` | Onde e qual registro |
| `operacao` | INSERT / UPDATE / DELETE |
| `dados_antes` / `dados_depois` | JSONB (sensíveis omitidos) |
| `usuario_db` | `CURRENT_USER` |
| `app_usuario` | Opcional via `SET LOCAL app.user_id` |
| `criado_em` | Timestamp |

## Funções e triggers

| Função | Papel |
|--------|-------|
| `fn_audit_row` | Auditoria (+ strip de `password_hash`) |
| `fn_set_updated_at` | `updated_at` |
| `fn_pedido_item_before` | Valida item + `subtotal` |
| `fn_pedido_recalc_total` | Soma → `pedido.total` |
| `fn_pedido_before_write` / `_update` | Cliente ativo / cancelado |

Convenção de nomes: `fn_<dominio>_<acao>` · `trg_<tabela>_<bi|bu|aiud>_<objetivo>`.

---

## Aplicar

```bash
bash database/scripts/migrate.sh
# ou só triggers:
bash database/scripts/apply-triggers.sh
```

```sql
SELECT c.relname, t.tgname
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
WHERE NOT tgisinternal AND tgname LIKE 'trg_%'
ORDER BY 1, 2;
```

## Cuidados

- Evitar lógica pesada em trigger por linha.
- Documentar regras que só existirem no banco.
- Em alto volume, planejar retenção/partição de `audit_log` ([`escalabilidade.md`](../../docs/projeto/escalabilidade.md)).
