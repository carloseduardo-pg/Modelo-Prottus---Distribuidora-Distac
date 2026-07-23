# API Distac — backend

NestJS + Prisma + PostgreSQL + JWT (cookies **httpOnly**).  
Parte da base Prottus: auth, CRUDs, Helmet, rate limit, dashboard summary.

Docs: [`../docs/projeto/seguranca.md`](../docs/projeto/seguranca.md) · [`../docs/projeto/escalabilidade.md`](../docs/projeto/escalabilidade.md)

## Estrutura

```
src/
  auth/         login, refresh, logout, me
  clientes/     CRUD + options + paginação
  produtos/     CRUD + options + paginação
  pedidos/      CRUD + itens
  dashboard/    summary
  common/       paginação
prisma/         schema + migrations (+ triggers SQL)
```

## Comandos

```bash
# Postgres local — ver ../database/
npm install
npx prisma migrate deploy   # ou: bash ../database/scripts/migrate.sh
npm run start:dev
```

API: http://127.0.0.1:3000/api · Health: `/api/health`
