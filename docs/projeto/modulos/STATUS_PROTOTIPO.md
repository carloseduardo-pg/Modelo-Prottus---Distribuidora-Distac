# Status do protótipo — Distac

**Atualizado:** 2026-07-23  
**Papel:** produto Distac + **base de referência Prottus** (web).

## Resumo

| Camada | Status |
|--------|--------|
| Docs Prottus (`docs/prottus/`) | Intactos (metodologia empresa) |
| Docs projeto | Completos — domínio, **segurança**, **escalabilidade**, base |
| Frontend | OK — login, shell, CRUDs paginados |
| Backend | OK — auth JWT httpOnly, CRUDs, summary, Helmet, rate limit |
| Banco | OK — Prisma + triggers + `audit_log` |
| Testes | OK — `tests/load` (segurança + carga) |

## Rotas

| Rota | Status |
|------|--------|
| `/login` | OK |
| `/` início (summary) | OK |
| `/clientes` | OK |
| `/produtos` | OK |
| `/pedidos` | OK |

## Métricas de qualidade (Gate)

| Métrica | Evidência |
|---------|-----------|
| Segurança | [`seguranca.md`](../seguranca.md) + testes 401 / Helmet / 429 |
| Escalabilidade | [`escalabilidade.md`](../escalabilidade.md) + paginação / summary |
| Anonimização | `password_hash` fora do `audit_log` |
| Operação DB | [`database/`](../../../database/) |

## Como subir

Ver [README.md](../../../README.md) na raiz.
