# Tabelas — Distac / Prottus base

Domínio em **inglês**. Detalhes de campos: [`docs/projeto/mapa-entidades.md`](../../docs/projeto/mapa-entidades.md).

| Tabela | Papel |
|--------|-------|
| `users` | Autenticação / vendedores |
| `clients` | Lojas clientes |
| `products` | Catálogo |
| `orders` | Pedidos (total via trigger) |
| `order_items` | Itens (line_total via trigger) |
| `audit_log` | Auditoria DML (só triggers) |

Triggers: [`triggers.md`](triggers.md).
