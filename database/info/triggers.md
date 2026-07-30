# Triggers — Distac / Prottus base

Conceito: gatilhos DML para integridade, cascata e auditoria.  
Implementação: **PostgreSQL**, row-level, BEFORE/AFTER.

| Artefato | Caminho |
|----------|---------|
| Script canônico | [`../sql/03-triggers.sql`](../sql/03-triggers.sql) |
| Migration | `backend/prisma/migrations/20260730160000_init_english_domain_audit/` |
| Segurança | [`../../docs/projeto/seguranca.md`](../../docs/projeto/seguranca.md) |

Ao clonar para outro cliente: adapte tabelas/regras e **mantenha** `audit_log` + omissão de hashes.

## Objetivos

| Objetivo | Aplicação |
|----------|-----------|
| Integridade | BEFORE em `order_items`: quantidade, preço, pedido não cancelado |
| Cascata | AFTER item → `orders.total` |
| Auditoria | AFTER DML → `audit_log` (JSON **sem** `password_hash`) |
| Automação | `updated_at`, `line_total` |

A API valida para UX; o banco é a segunda linha de defesa. **`orders.total` não é gravado pela API** — o service relê após create/update.

## Funções principais

| Função | Papel |
|--------|-------|
| `fn_order_item_before` | Valida + calcula `line_total` |
| `fn_order_recalc_total` | Recalcula `orders.total` |
| `fn_set_updated_at` | `updated_at` |
| `fn_audit_row` | Auditoria genérica |

## Tabelas auditadas

`users`, `clients`, `products`, `orders`, `order_items`.
