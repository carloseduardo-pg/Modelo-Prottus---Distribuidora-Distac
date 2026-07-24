# Distac — Vendas Internas

**Referência operacional da Prottus** para stack web (React + NestJS + PostgreSQL): este repositório é o projeto Distac **e** a base pronta para iniciar outros clientes com a mesma estrutura.

Não há pastas “template genérico” à parte — o que está aqui (schema, auth, banco, testes, docs de projeto) **é** o modelo.

Metodologia de qualidade da empresa (somente leitura): [`docs/prottus/`](docs/prottus/).  
Decisões deste produto: [`docs/projeto/`](docs/projeto/).

---

## Pilares obrigatórios (métricas de desenvolvimento)

| Pilar | O que este projeto demonstra | Doc |
|-------|------------------------------|-----|
| **Segurança** | JWT httpOnly, Helmet, rate limit, secrets no `.env`, triggers + `audit_log`, dados sensíveis omitidos na auditoria | [`docs/projeto/seguranca.md`](docs/projeto/seguranca.md) |
| **Escalabilidade** | Paginação, summary no dashboard, índices/triggers leves, caminho claro para crescer sem reescrever tudo | [`docs/projeto/escalabilidade.md`](docs/projeto/escalabilidade.md) |
| **Domínio claro** | Só `cliente`, `produto`, `pedido`, `pedido_item` (+ `user` / `audit_log` de plataforma) | [`docs/projeto/mapa-entidades.md`](docs/projeto/mapa-entidades.md) |
| **Banco operacional** | Postgres local, scripts, migrations, triggers versionados | [`database/`](database/) |
| **Qualidade verificável** | Smoke de segurança + carga | [`tests/`](tests/) |

Nem todo cliente precisará da mesma escala — o ponto é **entender o contexto** e manter o caminho aberto (ver escalabilidade). Segurança e anonimização de sensíveis **sempre**.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React · Vite · TypeScript |
| Backend | NestJS · TypeScript |
| Banco | PostgreSQL local + Prisma |
| Auth | JWT (access + refresh) em cookie **httpOnly** |

---

## Como rodar

### 1) PostgreSQL (local, sem Docker)

```bash
bash database/scripts/setup.sh
bash database/scripts/migrate.sh   # migrations + seed
bash database/scripts/check.sh
```

| Host | Porta | Usuário | Senha | DB |
|------|-------|---------|-------|-----|
| `127.0.0.1` | `5432` | `postgree` | `postgree` | `distac` |

### 2) API

```bash
cd backend && npm install && npm run start:dev
```

- http://127.0.0.1:3000/api · health: `/api/health`

### 3) UI

```bash
cd frontend && npm install && npm run dev
```

- http://127.0.0.1:5173

### 4) Login (seed local)

| Campo | Valor |
|-------|-------|
| E-mail | `vendedor@distac.local` |
| Senha | `distac123` |

Campos de login **não** vêm pré-preenchidos (segurança).

### 5) Testes de carga / segurança (3 níveis)

```bash
# API no ar — na raiz do projeto
node tests/load/run-node.mjs smoke    # rápido
node tests/load/run-node.mjs normal   # padrão
node tests/load/run-node.mjs heavy    # stress
```

Detalhes e leitura do terminal: [`tests/README.md`](tests/README.md).

---

## Usar este repo como base de um novo cliente

1. Copiar/clonar este repositório (estrutura completa).
2. Trocar marca, brief e domínio em `docs/projeto/` + `.cursor/rules/projeto/`.
3. Ajustar `backend/prisma/schema.prisma`, seed e CRUDs ao novo domínio.
4. Manter intactos: pasta `docs/prottus/`, `.cursor/rules/prottus/`, padrões de **segurança**, **paginação**, **JWT httpOnly**, **triggers/audit** e **tests/**.
5. Atualizar `.env` (nunca versionar secrets reais).

Guia curto: [`docs/projeto/USAR-COMO-BASE.md`](docs/projeto/USAR-COMO-BASE.md).

---

## Pastas

| Pasta | Função |
|-------|--------|
| `backend/` | API NestJS + Prisma |
| `frontend/` | SPA React |
| `database/` | Postgres — scripts, SQL, info operacional |
| `tests/` | Carga e smoke de segurança (3 níveis) |
| `docs/projeto/` | Documentação **deste** produto (e referência de base) |
| `docs/prottus/` | Metodologia Prottus (**não editar**) |
| `.cursor/rules/` | Regras Cursor (Prottus + Distac) |
| `.cursor/skills/` | Skills Cursor do projeto (fluxos essenciais) |
| `imagens/` | Logo Distac |
| `.env` / `backend/.env` | Locais (gitignored) |

## Documentação principal

| Tema | Link |
|------|------|
| **Domínio técnico (tech lead)** | [`docs/projeto/DOMINIO-TECNICO.md`](docs/projeto/DOMINIO-TECNICO.md) |
| **Onboarding do editor** | [`docs/projeto/PLUGINS-E-PADRONIZACAO.md`](docs/projeto/PLUGINS-E-PADRONIZACAO.md) |
| Contexto | [`docs/projeto/contexto.md`](docs/projeto/contexto.md) |
| Specs técnicas | [`docs/projeto/especificacoes.md`](docs/projeto/especificacoes.md) |
| **Segurança** | [`docs/projeto/seguranca.md`](docs/projeto/seguranca.md) |
| **Escalabilidade** | [`docs/projeto/escalabilidade.md`](docs/projeto/escalabilidade.md) |
| Domínio de negócio | [`docs/projeto/mapa-entidades.md`](docs/projeto/mapa-entidades.md) |
| Status | [`docs/projeto/modulos/STATUS_PROTOTIPO.md`](docs/projeto/modulos/STATUS_PROTOTIPO.md) |
| Banco | [`database/`](database/) · triggers [`database/info/triggers.md`](database/info/triggers.md) |
| Testes | [`tests/README.md`](tests/README.md) |
| Usar como base | [`docs/projeto/USAR-COMO-BASE.md`](docs/projeto/USAR-COMO-BASE.md) |
| Cursor (rules + skills) | [`.cursor/README.md`](.cursor/README.md) |
| Swagger (API no ar) | http://localhost:3000/api/docs |
