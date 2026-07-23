# Cursor — Cadu

**Repositório:** Distac — Vendas Internas (**base web Prottus**)  
**Última atualização:** 2026-07-23  
**Local:** `.cursor/agents/cursor-cadu.md`

---

## Estado atual (snapshot)

| Item | Valor |
|------|-------|
| Cliente | Distribuidora Distac |
| Papel do repo | Produto Distac + referência inicial Prottus |
| Stack | React+Vite+TS · NestJS · Prisma · PostgreSQL · JWT httpOnly |
| Segurança | Helmet, rate limit, audit_log sem password_hash, cookies httpOnly |
| Escala | Paginação, summary, doc de evolução |
| Status | Protótipo completo + docs de base alinhados |

---

## Histórico de sessões

### 2026-07-23 — Kickoff + scaffold + CRUDs

Fundação, stack, marca, login, CRUDs, DB local sem Docker.

### 2026-07-23 — Segurança, escala, triggers, testes

Helmet, Throttler, paginação, summary, triggers/`audit_log`, load tests.

### 2026-07-23 — Documentação como base Prottus

- README e `docs/projeto` orientados: Distac **é** o modelo (sem pasta template genérica)
- Novos: `seguranca.md`, `escalabilidade.md`, `USAR-COMO-BASE.md`
- RNFs e rules Cursor atualizados; Scriptcase N/A removido das specs

---

## Pendências

- Homolog/prod, CI/CD, TLS
- Revogação de refresh token em produção (se exigido)
- FUNCTIONS.md se o time exigir

## Como atualizar

Append no Histórico. Manter snapshot atualizado.
