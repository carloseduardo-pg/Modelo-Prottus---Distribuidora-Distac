# Status da base — Distac (referência Prottus)

**Atualizado:** 2026-07-27  
**Papel:** produto Distac **e** base web reutilizável da Prottus (pronta para clonar).

## Veredito

| Critério | Status |
|----------|--------|
| Clone / onboarding documentado | OK — README + [`USAR-COMO-BASE.md`](../USAR-COMO-BASE.md) |
| Segurança (JWT httpOnly, Helmet, throttle, audit) | OK |
| Escalabilidade (paginação, summary, options) | OK |
| Domínio técnico (tech lead) | OK — [`DOMINIO-TECNICO.md`](../DOMINIO-TECNICO.md) |
| Testes smoke/carga | OK — `tests/load` |
| Homolog/prod / CI | A definir **por cliente** (não bloqueia o modelo local) |

## Camadas

| Camada | Status |
|--------|--------|
| Docs Prottus (`docs/prottus/`) | Intactos (metodologia empresa — não editar) |
| Docs projeto | Completos |
| Frontend | OK — login vazio, shell, CRUDs paginados |
| Backend | OK — auth JWT global, CRUDs, summary, Swagger |
| Banco | OK — Prisma + triggers + `audit_log` |
| Testes | OK — unitários de services + carga 3 níveis |
| Modelo Cursor (`.cursor/`) | OK — rules + skills |

## Rotas UI

| Rota | Status |
|------|--------|
| `/login` | OK |
| `/` início (summary) | OK |
| `/clientes` | OK |
| `/produtos` | OK |
| `/pedidos` | OK |

## Como subir

Ver [README.md](../../../README.md) na raiz (ou `npm run setup` / `npm run dev:api` / `npm run dev:web` a partir do `package.json` da raiz).
