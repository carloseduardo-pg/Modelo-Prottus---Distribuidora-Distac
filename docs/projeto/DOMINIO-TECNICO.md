# Domínio técnico — Distac (base Prottus)

**Audiência:** tech leads e desenvolvedores que precisam **dominar** este repositório — não só “saber onde clicar”.  
**Objetivo:** chegar em reunião técnica e explicar **o que está no código**, **por que** está assim e **o impacto** para a Prottus e para o cliente.

Documentos irmãos (detalhe operacional):

| Tema | Arquivo |
|------|---------|
| Specs / stack confirmada | [`especificacoes.md`](especificacoes.md) |
| Segurança | [`seguranca.md`](seguranca.md) |
| Escalabilidade | [`escalabilidade.md`](escalabilidade.md) |
| Domínio de negócio | [`mapa-entidades.md`](mapa-entidades.md) |
| Banco (ops) | [`../../database/README.md`](../../database/README.md) |
| Triggers | [`../../database/info/triggers.md`](../../database/info/triggers.md) |
| Testes | [`../../tests/README.md`](../../tests/README.md) |
| Reuso do repo | [`USAR-COMO-BASE.md`](USAR-COMO-BASE.md) |

Metodologia empresa (não editar): [`../prottus/metodologia.md`](../prottus/metodologia.md).

---

## 1. Como usar este documento

| Situação | O que ler |
|----------|-----------|
| Onboarding de dev (1º dia) | §2 + §3 + §9 |
| Antes de reunião de arquitetura | §2 + §3 + §6 + §7 + §10 |
| Incidente de auth / 401 / cookie | §4 + §6 + `seguranca.md` |
| “Por que não usamos X?” | §3 (coluna *Alternativas não escolhidas*) |
| Novo cliente a partir desta base | [`USAR-COMO-BASE.md`](USAR-COMO-BASE.md) |

**Regra Prottus:** se está no código ou no `.env`, alguém do time precisa saber explicar. Este doc é o mapa.

---

## 2. Visão da operação (o sistema em uma página)

```
┌─────────────────┐     cookies httpOnly      ┌──────────────────────┐
│  SPA React      │  ←──────────────────────→ │  API NestJS          │
│  Vite :5173     │   credentials: include    │  :3000 /api          │
│  React Router   │                           │  Helmet · Throttler  │
│  AuthContext    │                           │  JWT · ValidationPipe│
└─────────────────┘                           └──────────┬───────────┘
                                                         │ Prisma
                                                         ▼
                                              ┌──────────────────────┐
                                              │  PostgreSQL :5432    │
                                              │  DB distac           │
                                              │  triggers + audit_log│
                                              └──────────────────────┘
```

| Camada | Porta | Pasta |
|--------|-------|--------|
| UI | `5173` | `frontend/` |
| API | `3000` (`/api`) | `backend/` |
| Banco | `5432` | Postgres local + `database/` + `backend/prisma/` |

**Estilo:** monólito modular mono-repo (API + SPA).  
**Sem Docker** neste padrão — Postgres instalado na máquina; previsibilidade para vibe coding / onboarding.

**Papel do repo:** produto Distac **e** base reutilizável Prottus para outros clientes.

---

## 3. Catálogo de tecnologias (o “porquê” de cada uma)

Para cada item: **o que é**, **por que escolhemos**, **impacto na empresa**, **onde vive no código**, **o que um lead deve saber responder**.

### 3.1 TypeScript (FE + BE)

| | |
|--|--|
| **O que** | Tipagem estática sobre JavaScript |
| **Por quê** | Menos regressão em CRUD/refactors; contratos claros entre API e UI; padrão de mercado para times mistos |
| **Impacto Prottus** | Onboarding mais rápido; menos “surpresa” em produção; documentação viva nos tipos |
| **Onde** | Todo `frontend/src`, `backend/src`, Prisma Client gerado |
| **Lead deve saber** | Tipos do domínio em `frontend/src/lib/types.ts`; DTOs com `class-validator` no Nest |

### 3.2 React 19 + Vite 8

| | |
|--|--|
| **O que** | Biblioteca de UI + bundler/dev server |
| **Por quê** | SPA rápida de desenvolver; HMR; ecossistema enorme; Vite é padrão moderno (substitui CRA) |
| **Impacto** | Entrega visual Distac com ciclo curto; fácil plugar telas CRUD |
| **Onde** | `frontend/` — `vite.config.ts`, `src/main.tsx`, `src/pages/*` |
| **Lead deve saber** | Sem Redux/Zustand/React Query de propósito — Context + `useState` bastam neste escopo |
| **Não escolhido** | Next.js (SSR desnecessário para app interno autenticado por cookie same-site); Angular (curva maior para este tamanho) |

### 3.3 React Router DOM 7

| | |
|--|--|
| **O que** | Rotas no cliente |
| **Por quê** | Navegação `/login`, `/clientes`, etc. sem recarregar a página |
| **Onde** | `frontend/src/App.tsx` + `ProtectedRoute` |
| **Lead deve saber** | Rotas de negócio ficam **dentro** de `ProtectedRoute` + `AppShell` |

### 3.4 NestJS 11 (Node / Express)

| | |
|--|--|
| **O que** | Framework backend modular (módulos, DI, guards, pipes) |
| **Por quê** | Estrutura previsível para CRUD empresarial; autenticação/guards nativos; escala por módulo sem virar “pasta solta de Express” |
| **Impacto** | Time padroniza pastas (`auth`, `clientes`, `pedidos`); fácil treinar; base para outros clientes |
| **Onde** | `backend/src/*` — `main.ts`, `app.module.ts`, módulos por domínio |
| **Lead deve saber** | Prefixo global `api`; `JwtAuthGuard` **não** é global — só nas rotas protegidas; `ThrottlerGuard` **é** global |
| **Não escolhido** | Express “cru” (falta estrutura); Fastify adapter (Express é o default Nest e suficiente aqui) |

### 3.5 PostgreSQL

| | |
|--|--|
| **O que** | SGBD relacional |
| **Por quê** | Integridade (FK, unique), SQL maduro, triggers, JSONB para auditoria; padrão sólido B2B |
| **Impacto** | Dados de venda confiáveis; auditoria no banco; DBA/ops conhecem o ecossistema |
| **Onde** | Local `127.0.0.1:5432` / DB `distac` / user `postgree` |
| **Lead deve saber** | Tabelas de negócio: `cliente`, `produto`, `pedido`, `pedido_item`; plataforma: `user`, `audit_log` |
| **Não escolhido** | MariaDB/MySQL (primeira versão do modelo); Mongo (domínio relacional de pedido/itens); SQLite (não para multi-dev/prod) |

### 3.6 Prisma 6

| | |
|--|--|
| **O que** | ORM + migrations + client tipado |
| **Por quê** | Schema único (`schema.prisma`); migrations versionadas; tipagem alinhada ao TypeScript |
| **Impacto** | Mudança de domínio vira migration revisável em PR; menos SQL solto inconsistente |
| **Onde** | `backend/prisma/schema.prisma`, `migrations/`, `PrismaService` |
| **Lead deve saber** | `migrate deploy` (scripts) vs `migrate dev` (interativo — evitar em script de equipe); seed em `prisma/seed.ts` |
| **Não escolhido** | TypeORM (mais boilerplate); Knex só query builder |

### 3.7 JWT + Passport (`passport-jwt`) + cookies httpOnly

| | |
|--|--|
| **O que** | Access + refresh tokens em cookies `access_token` / `refresh_token` |
| **Por quê** | SPA precisa de sessão; **httpOnly** mitiga XSS roubando token do `localStorage`; access curto (15m) + refresh (7d) |
| **Impacto** | Postura de segurança alinhada a produto interno; discurso claro em auditoria (“token não fica no JS”) |
| **Onde** | `auth.controller.ts` (setCookie), `jwt.strategy.ts` (extrai cookie), `frontend/src/lib/api.ts` (`credentials: 'include'`) |
| **Lead deve saber** | FE **não** lê o JWT — só perfil `{id,email,name}` no Context; `SameSite=lax`; `Secure` só em `NODE_ENV=production` |
| **Não escolhido** | JWT no `localStorage` (XSS); session server-side Redis (complexidade cedo demais); OAuth externo (fora do escopo Distac) |

### 3.8 bcrypt

| | |
|--|--|
| **O que** | Hash de senha (cost **10**) |
| **Por quê** | Senha nunca em claro; padrão de indústria |
| **Onde** | `auth.service.ts`, seed |
| **Lead deve saber** | `audit_log` **omite** `password_hash` nos JSON |

### 3.9 Helmet

| | |
|--|--|
| **O que** | Headers HTTP de segurança (ex.: `X-Content-Type-Options: nosniff`) |
| **Por quê** | Hardening barato e imediato |
| **Onde** | `backend/src/main.ts` |
| **Lead deve saber** | Testes smoke/normal/heavy validam `nosniff` |

### 3.10 @nestjs/throttler (rate limit)

| | |
|--|--|
| **O que** | Limite de requisições por IP |
| **Por quê** | Freia brute force no login e abuso de API |
| **Valores** | Global **300/min**; login **10/min**; refresh **20/min**; `/health` **sem** throttle |
| **Impacto** | Em teste **heavy**, muitos **429** são **proteção**, não bug |
| **Onde** | `app.module.ts`, `@Throttle` no `AuthController`, `@SkipThrottle` no health |
| **Lead deve saber** | Rodar heavy logo após normal pode deixar 429 residual no check de auth — o runner trata isso |

### 3.11 class-validator + ValidationPipe

| | |
|--|--|
| **O que** | Validação de DTO na borda da API |
| **Por quê** | Rejeita payload estranho (`forbidNonWhitelisted`); menos lixo no banco |
| **Onde** | `main.ts` (pipe global); `dto/*` |

### 3.12 cookie-parser + CORS com credentials

| | |
|--|--|
| **O que** | Lê cookies na API; libera origem do front com credenciais |
| **Por quê** | Sem isso, cookie httpOnly não flui FE↔BE em origens diferentes (5173 vs 3000) |
| **Onde** | `main.ts` — `CORS_ORIGIN` default `http://localhost:5173` |
| **Lead deve saber** | Em prod, origem deve ser o domínio real do front; `credentials: true` é obrigatório neste desenho |

### 3.13 Triggers PostgreSQL + `audit_log`

| | |
|--|--|
| **O que** | Funções/triggers DML (BEFORE/AFTER) |
| **Por quê** | Integridade mesmo se alguém usar SQL direto; total do pedido recalculado; trilha de auditoria |
| **Impacto** | Defesa em profundidade; compliance leve; padrão reutilizável |
| **Onde** | `database/sql/03-triggers.sql` + migration de triggers |
| **Lead deve saber** | API valida (UX); banco reforça; pedido **cancelado** não edita itens; seed desliga trigger só na limpeza |

### 3.14 Testes Node (`tests/load/run-node.mjs`) — 3 níveis

| | |
|--|--|
| **O que** | Smoke / normal / heavy sem depender de k6 |
| **Por quê** | Qualidade verificável; prova segurança + baseline de carga |
| **Impacto** | Gate objetivo antes de chamar o protótipo “pronto” |
| **Onde** | `tests/` |
| **Lead deve saber** | Comandos e interpretação em `tests/README.md` |

### 3.15 Oxlint (FE) / ESLint + Prettier (BE)

| | |
|--|--|
| **O que** | Linters |
| **Por quê** | Padronização de código; Oxlint é rápido no front Vite |
| **Onde** | scripts `lint` nos `package.json` |

---

## 4. Ciclo de uma requisição (do browser ao banco)

### 4.1 Login

1. UI `POST /api/auth/login` com e-mail/senha (`credentials: 'include'`).
2. Nest valida DTO → bcrypt → emite JWT access/refresh.
3. Resposta seta cookies httpOnly + body `{ user }` (sem token no JSON).
4. `AuthContext` guarda só o perfil.

### 4.2 Chamada autenticada (ex.: listar clientes)

1. UI `GET /api/clientes?page=1&pageSize=20` com cookies.
2. `ThrottlerGuard` (global) → pode 429.
3. `JwtAuthGuard` lê `access_token` → 401 se inválido/ausente.
4. Se FE recebe 401: tenta `POST /api/auth/refresh` e **repete** a chamada (`api.ts`).
5. Service Prisma pagina e devolve `{ data, total, page, pageSize, totalPages }`.

### 4.3 Mutação de pedido/itens

1. API valida cliente ativo / produtos / regras de negócio.
2. Persistência Prisma.
3. Triggers: recalculam `subtotal`/`total`; gravam `audit_log`; bloqueiam edição se cancelado.

**Frase de reunião:** *“A gente não confia só na API: o Postgres também guarda a regra.”*

---

## 5. Domínio de dados (o que o lead desenha no quadro)

```
user (auth)
cliente 1 ─── N pedido 1 ─── N pedido_item N ─── 1 produto
                 │
                 └── status: rascunho | confirmado | cancelado
                 └── total ← soma(subtotais) [trigger]

audit_log ← INSERT/UPDATE/DELETE (triggers; sem password_hash)
```

| Tabela | Para quê |
|--------|----------|
| `cliente` | Loja B2B (CNPJ único) |
| `produto` | Catálogo (código único, preço) |
| `pedido` | Cabeçalho da venda |
| `pedido_item` | Linhas (qtd × preço = subtotal) |
| `user` | Login interno |
| `audit_log` | Histórico DML |

Detalhe de campos: [`mapa-entidades.md`](mapa-entidades.md).

---

## 6. Modelo de segurança (checklist verbal)

Memorize estes pontos:

1. Token **não** está no `localStorage`.
2. Cookies **httpOnly** + `SameSite=lax` (+ `Secure` em prod).
3. Secrets JWT **obrigatórios** no `.env` (sem fallback fraco).
4. Helmet + rate limit (login apertado).
5. DTOs com whitelist.
6. CRUDs exigem JWT.
7. Hash bcrypt; audit **sem** `password_hash`.
8. Login **sem** senha pré-preenchida na UI.

Limitações conscientes do protótipo (não esconder em reunião):

- Refresh **não** tem denylist no banco (roubo vale até expirar).
- CSRF mitigado por SameSite/CORS — em cenários mais agressivos pode precisar de token CSRF.
- Seed/login de exemplo só para **local**.

Detalhe: [`seguranca.md`](seguranca.md).

---

## 7. Modelo de escalabilidade (checklist verbal)

1. **Paginação** (máx. 100) em listagens — nunca “trazer a tabela toda” por padrão.
2. **Summary** no dashboard — agrega sem 3 listagens completas.
3. **Options** leves para selects de pedido.
4. Monólito modular — cresce por módulo Nest.
5. Testes de carga documentam baseline (p95, 429).
6. Cache/fila/Redis: **só com evidência** — ver [`escalabilidade.md`](escalabilidade.md).

**Frase de reunião:** *“Nem todo cliente precisa de Kafka; todo cliente precisa de paginação e auth decente.”*

---

## 8. Mapa de pastas (orientação espacial)

```
Teste 2 / Modelo Distac
├── frontend/          # React + Vite
├── backend/           # NestJS + Prisma
│   └── prisma/        # schema + migrations + seed
├── database/          # ops Postgres (scripts, SQL triggers, info)
├── tests/             # smoke | normal | heavy
├── docs/projeto/      # verdade do produto + este handbook
├── docs/prottus/      # metodologia empresa (não editar)
├── imagens/           # logo Distac
└── .env.example       # template (nunca commitar .env real)
```

---

## 9. Operação local (o lead precisa conseguir subir)

```bash
# Banco
bash database/scripts/setup.sh
bash database/scripts/migrate.sh    # deploy migrations + seed
bash database/scripts/check.sh

# API
cd backend && npm install && npm run start:dev

# UI
cd frontend && npm install && npm run dev

# Testes (API no ar)
node tests/load/run-node.mjs smoke
node tests/load/run-node.mjs normal
node tests/load/run-node.mjs heavy
```

| Item | Valor local |
|------|-------------|
| Login seed | `vendedor@distac.local` / `distac123` |
| API | http://127.0.0.1:3000/api |
| Health | http://127.0.0.1:3000/api/health |
| UI | http://127.0.0.1:5173 |

Env críticos: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, `PORT`, `NODE_ENV`.

---

## 10. Decisões e trade-offs (para defender em reunião)

| Decisão | Benefício | Custo / risco |
|---------|-----------|----------------|
| Sem Docker | Setup simples no Fedora/dev | “Funciona na minha máquina” — documentar versões Postgres |
| Cookies httpOnly | Mais seguro vs XSS | Precisa CORS+credentials; mobile nativo pediria outro desenho |
| Prisma | Velocidade + tipos | Triggers/SQL avançado fora do “happy path” Prisma |
| Throttler in-memory | Simples | Em multi-instância precisa store compartilhado (Redis) |
| Monólito modular | Menos ops | Limite futuro → extrair módulo só com dor real |
| Audit no Postgres | Independente da API | `audit_log` cresce — planejar retenção |

---

## 11. Cola rápida para reunião (60 segundos)

- **Stack:** React+Vite+TS · NestJS+TS · Prisma · PostgreSQL · JWT em cookie httpOnly.  
- **Domínio:** 4 tabelas de venda + `user` + `audit_log`.  
- **Segurança:** Helmet, rate limit, ValidationPipe, bcrypt, audit sem hash, sem token no localStorage.  
- **Escala:** paginação, summary, options, testes smoke/normal/heavy.  
- **Banco:** triggers de total/integridade/auditoria.  
- **Repo:** base Prottus — copiar e trocar domínio/marca, manter pilares.  
- **Subir:** `database/scripts/*` → backend → frontend → `node tests/load/run-node.mjs smoke`.

---

## 12. O que o time deve saber apontar no código

| Pergunta | Arquivo |
|----------|---------|
| Onde o cookie é setado? | `backend/src/auth/auth.controller.ts` |
| Onde o JWT é lido? | `backend/src/auth/jwt.strategy.ts` |
| Onde está o Helmet/CORS? | `backend/src/main.ts` |
| Onde está o rate limit global? | `backend/src/app.module.ts` |
| Onde pagina? | `backend/src/common/pagination.ts` |
| Onde o FE manda cookie? | `frontend/src/lib/api.ts` |
| Onde está a sessão React? | `frontend/src/auth/AuthContext.tsx` |
| Onde está o schema? | `backend/prisma/schema.prisma` |
| Onde estão os triggers? | `database/sql/03-triggers.sql` |
| Onde rodam os 3 níveis de teste? | `tests/load/run-node.mjs` |

---

## 13. Critério de “domínio técnico adquirido”

Um desenvolvedor (ou lead) está apto neste projeto-base quando consegue, sem ler o chat:

- [ ] Explicar o fluxo login → cookie → refresh → CRUD  
- [ ] Dizer por que **não** usamos JWT no `localStorage`  
- [ ] Explicar o que um **429** significa no heavy  
- [ ] Nomear as 6 tabelas e o papel de `audit_log`  
- [ ] Subir banco + API + UI do zero  
- [ ] Rodar `smoke` e interpretar PASS/FAIL  
- [ ] Listar 3 coisas que mudam vs 3 que permanecem ao clonar para outro cliente  

Se faltar um item, reler as seções §3–§9 e os docs irmãos linkados no topo.
