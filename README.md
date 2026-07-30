# Distac — Vendas Internas

**Referência operacional da Prottus** para stack web (React + NestJS + PostgreSQL): este repositório é o produto Distac **e** a base pronta para iniciar outros clientes com a mesma estrutura.

Não há pastas “template genérico” à parte — o que está aqui (schema, auth, banco, testes, docs de projeto) **é** o modelo.

Metodologia de qualidade da empresa (somente leitura): [`docs/prottus/`](docs/prottus/).  
Decisões deste produto: [`docs/projeto/`](docs/projeto/).  
**Status da base:** [`docs/projeto/modulos/STATUS_PROTOTIPO.md`](docs/projeto/modulos/STATUS_PROTOTIPO.md).

---

## Pilares obrigatórios (métricas de desenvolvimento)

| Pilar | O que este projeto demonstra | Doc |
|-------|------------------------------|-----|
| **Segurança** | JWT httpOnly (guard global), Helmet, rate limit, secrets no `.env`, triggers + `audit_log` | [`docs/projeto/seguranca.md`](docs/projeto/seguranca.md) |
| **Escalabilidade** | Paginação, summary, options, caminho documentado para crescer | [`docs/projeto/escalabilidade.md`](docs/projeto/escalabilidade.md) |
| **Domínio claro** | `clients`, `products`, `orders`, `order_items` (+ `users` / `audit_log`) — código EN, UI PT | [`docs/projeto/mapa-entidades.md`](docs/projeto/mapa-entidades.md) |
| **Banco operacional** | Postgres local, scripts, migrations, triggers (`orders.total` no DB) | [`database/`](database/) |
| **Qualidade verificável** | Unitários + smoke (`tests/`) + stress (`backend/stress/`) | [`tests/`](tests/) · [`backend/stress/`](backend/stress/) |

Segurança e anonimização de sensíveis **sempre**. Escala conforme o cliente.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React · Vite · TypeScript |
| Backend | NestJS · TypeScript |
| Banco | PostgreSQL local + Prisma (**sem Docker**) |
| Auth | JWT access + refresh em cookie **httpOnly** |

---

## Como rodar

Pré-requisito: PostgreSQL em `127.0.0.1:5432`. Copiar [`.env.example`](.env.example) → `.env` e `backend/.env`.

### Opção A — scripts na raiz

```bash
npm run install:all
npm run setup          # setup DB + migrate + check
npm run dev:api        # terminal 1 — http://127.0.0.1:3000/api
npm run dev:web        # terminal 2 — http://127.0.0.1:5173
npm run test:smoke     # API no ar
```

### Opção B — passo a passo

```bash
# 1) Banco
bash database/scripts/setup.sh
bash database/scripts/migrate.sh   # migrations + seed Prisma
bash database/scripts/check.sh

# 2) API  (alias: npm run dev  ≡  start:dev)
cd backend && npm install && npm run dev

# 3) UI
cd frontend && npm install && npm run dev
```

| Serviço | URL |
|---------|-----|
| UI | http://127.0.0.1:5173 |
| API | http://127.0.0.1:3000/api |
| Health | http://127.0.0.1:3000/api/health |
| Swagger | http://127.0.0.1:3000/api/docs |

| Host | Porta | Usuário | Senha | DB |
|------|-------|---------|-------|-----|
| `127.0.0.1` | `5432` | `postgree` | `postgree` | `distac` |

### Login (seed local)

| Campo | Valor |
|-------|-------|
| E-mail | `vendedor@distac.local` |
| Senha | `distac123` |

Campos da UI **não** vêm pré-preenchidos.

O usuário seed é criado por:

1. **`prisma db seed`** (via `migrate.sh`) — sempre no fluxo local padrão  
2. **Opcional no boot da API** se `SEED_DEMO_USER_ON_BOOT=true` (default `false` em produção/clones; local Distac usa `true` no `.env.example`)

### Testes

```bash
npm run test           # unitários Nest (services)
npm run test:smoke     # carga/segurança smoke (API no ar)
npm run test:stress:smoke  # stress Nest (API no ar)
```

> Se o Postgres ainda tiver o schema português antigo (`cliente`, `pedido`…), **recrie o database** e rode `npm run setup` — a migration limpa é só domínio inglês.
Detalhes: [`tests/README.md`](tests/README.md).

---

## Usar como base de um novo cliente

1. Clonar/copiar este repositório.  
2. Trocar marca, brief e domínio (`docs/projeto/`, `.cursor/rules/projeto/`).  
3. Ajustar Prisma, seed e CRUDs.  
4. Manter: `docs/prottus/`, rules Prottus, JWT httpOnly, paginação, triggers/audit, `tests/`, ConfigModule + Swagger.  
5. Novo `.env` — **não** versionar secrets; em cliente real use `SEED_DEMO_USER_ON_BOOT=false`.

Guia: [`docs/projeto/USAR-COMO-BASE.md`](docs/projeto/USAR-COMO-BASE.md).

---

## Pastas

| Pasta | Função |
|-------|--------|
| `backend/` | API NestJS + Prisma |
| `frontend/` | SPA React |
| `database/` | Scripts e SQL Postgres |
| `tests/` | Carga / smoke |
| `docs/projeto/` | Docs do produto + base |
| `docs/prottus/` | Metodologia (**não editar**) |
| `.cursor/` | Rules + skills do agente (modelo Cursor) |
| `imagens/` | Logo Distac |

## Documentação principal

| Tema | Link |
|------|------|
| **Domínio técnico (tech lead)** | [`docs/projeto/DOMINIO-TECNICO.md`](docs/projeto/DOMINIO-TECNICO.md) |
| **Fluxo da aplicação (modelo)** | [`docs/projeto/FLUXO-APLICACAO.md`](docs/projeto/FLUXO-APLICACAO.md) |
| **Arquitetura web** | [`docs/projeto/ARQUITETURA-WEB.md`](docs/projeto/ARQUITETURA-WEB.md) |
| **Usar como base** | [`docs/projeto/USAR-COMO-BASE.md`](docs/projeto/USAR-COMO-BASE.md) |
| Segurança | [`docs/projeto/seguranca.md`](docs/projeto/seguranca.md) |
| Escalabilidade | [`docs/projeto/escalabilidade.md`](docs/projeto/escalabilidade.md) |
| Specs | [`docs/projeto/especificacoes.md`](docs/projeto/especificacoes.md) |
| Status | [`docs/projeto/modulos/STATUS_PROTOTIPO.md`](docs/projeto/modulos/STATUS_PROTOTIPO.md) |
| Banco / triggers | [`database/`](database/) · [`database/info/triggers.md`](database/info/triggers.md) |
| Testes | [`tests/README.md`](tests/README.md) |
| Cursor | [`.cursor/README.md`](.cursor/README.md) |
| Contribuição interna | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| Swagger (API no ar) | http://localhost:3000/api/docs |
