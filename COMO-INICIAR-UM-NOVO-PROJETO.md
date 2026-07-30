# Como iniciar um novo projeto com esta base

Esta base une o produto Distac e o padrão web Prottus. Para iniciar um cliente novo, preserve a fundação técnica e substitua somente a marca, o domínio e os módulos que pertencem ao cliente.

## Antes de alterar código

1. Leia `docs/projeto/especificacoes.md`, `seguranca.md`, `escalabilidade.md` e `USAR-COMO-BASE.md`.
2. Registre a descoberta em `docs/projeto/documentacao-base/`, contexto, requisitos e mapa de entidades.
3. Crie ou adapte a regra em `.cursor/rules/projeto/` e o registro pessoal em `.cursor/agents/`.
4. Só então modele migrations, módulos Nest e páginas React.

Não reescreva `docs/prottus/` nem as regras universais Prottus. O catálogo Scriptcase permanece disponível como referência de família de aplicação.

## Preparar e executar

Na raiz do repositório:

```bash
npm run install:all
npm run setup
npm run dev:api
npm run dev:web
```

O banco local é preparado pelos scripts de `database/`. Em terminais separados, a API fica em `http://localhost:3000/api` e a interface em `http://localhost:5173`.

| Recurso | Endereço |
|---|---|
| Health | `http://localhost:3000/api/health` |
| API | `http://localhost:3000/api` |
| Swagger | `http://localhost:3000/api/docs` |
| Interface | `http://localhost:5173` |

## Convenções que devem continuar

- Código, Prisma e persistência usam inglês: `clients`, `products`, `orders`, `order_items`, `users`.
- A interface e a documentação de negócio permanecem em português.
- A API tem prefixo obrigatório `/api`; documente e consuma, por exemplo, `/api/clients`.
- Mantenha Helmet, `JwtAuthGuard` global, cookies JWT httpOnly, CORS restrito, ValidationPipe e throttling.
- Mantenha `database/`, triggers de integridade/auditoria e `audit_log`; `orders.total` é calculado no PostgreSQL.
- Mantenha paginação, dashboard de resumo, Swagger e os testes de carga em `backend/stress/`.

## Adaptar para outro cliente

Altere em conjunto o schema Prisma, migrations, seed, módulos Nest, páginas React, documentação em `docs/projeto/`, marca e as skills `distac-*`. Atualize sempre `docs/projeto/fluxo-aplicacao.md`, o mapa de entidades e as specs dos módulos para refletirem as novas rotas e tabelas.

Consulte o playbook completo em [`docs/projeto/USAR-COMO-BASE.md`](docs/projeto/USAR-COMO-BASE.md).
