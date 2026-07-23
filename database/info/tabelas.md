# Tabelas — Distac

Fonte oficial do schema: [`../../backend/prisma/schema.prisma`](../../backend/prisma/schema.prisma).

## Domínio de vendas

| Tabela | Papel |
|--------|-------|
| `cliente` | Lojas / compradores B2B |
| `produto` | Catálogo de materiais |
| `pedido` | Cabeçalho da venda (`rascunho` / `confirmado` / `cancelado`) |
| `pedido_item` | Linhas (produto, qtd, preço, subtotal) |

## Auth (fora do domínio de vendas)

| Tabela | Papel |
|--------|-------|
| `user` | Login JWT dos vendedores internos |

## Auditoria (triggers)

| Tabela | Papel |
|--------|-------|
| `audit_log` | DML — sensíveis omitidos (`password_hash`) |

Detalhes: [`triggers.md`](triggers.md) · [`../../docs/projeto/seguranca.md`](../../docs/projeto/seguranca.md)

## Relacionamentos

```
cliente 1 ── N pedido
pedido  1 ── N pedido_item
produto 1 ── N pedido_item
```

Campos detalhados: [`../../docs/projeto/mapa-entidades.md`](../../docs/projeto/mapa-entidades.md).
