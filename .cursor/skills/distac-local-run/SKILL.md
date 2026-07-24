---
name: distac-local-run
description: >-
  Sobe e valida o ambiente local Distac (Postgres, migrate/seed, API Nest,
  UI Vite, healthcheck). Use when the user asks to run the project, start
  backend/frontend, setup database, migrate, seed, or fix local startup.
---

# Distac — subir ambiente local

## Ordem obrigatória

1. Postgres na porta `5432`
2. `bash database/scripts/setup.sh` (se DB/role ainda não existem)
3. `bash database/scripts/migrate.sh` → `prisma migrate deploy` + seed
4. `bash database/scripts/check.sh`
5. `cd backend && npm run start:dev` → `http://127.0.0.1:3000/api`
6. `cd frontend && npm run dev` → `http://127.0.0.1:5173`

## Env

- Copiar `.env.example` → `.env` e `backend/.env`
- Nunca commitar `.env`
- Vars: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, `PORT`

## Login seed

`vendedor@distac.local` / `distac123` (campos da UI vazios de propósito)

## Smoke rápido

```bash
curl -s http://127.0.0.1:3000/api/health
node tests/load/run-node.mjs smoke
```

## Erros comuns

| Sintoma | Ação |
|---------|------|
| Postgres recusado | Iniciar serviço local na 5432 |
| Seed `id` null / audit | Garantir migration `restore_audit_log_id_default` |
| Seed vs pedido cancelado | Seed já trata triggers — usar `migrate.sh` atual |
| Porta 3000 em uso | Um único `nest start --watch` |
| `migrate dev` pedindo nome | Usar `migrate.sh` (`deploy`), não `migrate dev` no script |

## Docs

`README.md` · `database/README.md` · `docs/projeto/DOMINIO-TECNICO.md`
