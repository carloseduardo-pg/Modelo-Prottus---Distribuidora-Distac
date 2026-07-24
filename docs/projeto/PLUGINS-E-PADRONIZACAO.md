# Onboarding do editor — plugins e padronização

**Público:** humano que clona o repo (dev / lead).  
**Não é skill Cursor** — o modelo do agente fica em `.cursor/skills/` e `.cursor/rules/`.

Objetivo: ambiente de edição **organizado e replicável** sem misturar isso com o fluxo do agente.

Há duas camadas neste doc:

1. **Extensões Cursor** (recomendadas pelo workspace)  
2. **Pacotes Nest** já no código (Config + Swagger)

---

## 1. Extensões (plugins do editor)

Arquivo: [`.vscode/extensions.json`](../../.vscode/extensions.json)

Ao abrir o projeto no Cursor, aceite **“Install Recommended Extensions”**.

| Extensão | ID | Para quê |
|----------|-----|----------|
| Prisma | `prisma.prisma` | Schema, migrations, highlight |
| ESLint | `dbaeumer.vscode-eslint` | Lint |
| Prettier | `esbenp.prettier-vscode` | Format on save (fonte da verdade de formatação) |
| Error Lens | `usernamehw.errorlens` | Erros inline |
| REST Client | `humao.rest-client` | Testar API via [`.vscode/distac.http`](../../.vscode/distac.http) |
| DotENV | `mikestead.dotenv` | `.env` com highlight |
| Pretty TS Errors | `yoavbls.pretty-ts-errors` | Erros TS legíveis |
| Path Intellisense | `christian-kohler.path-intellisense` | Autocomplete de imports |
| GitLens | `eamodio.gitlens` | Histórico/blame |
| Code Spell Checker | `streetsidesoftware.code-spell-checker` | Ortografia |
| Code Spell PT-BR | `streetsidesoftware.code-spell-checker-portuguese-brazilian` | PT-BR |

Workspace settings (EOL, format on save, etc.): [`.vscode/settings.json`](../../.vscode/settings.json)

### Instalação via CLI (opcional)

```bash
cursor --install-extension prisma.prisma
# … ou use o prompt automático do Cursor ao abrir o repo
```

---

## 2. Pacotes Nest integrados nesta base

| Pacote | Papel | Impacto |
|--------|-------|---------|
| `@nestjs/config` | Env tipado + validação no boot | Falha cedo se `.env` inválido |
| `@nestjs/swagger` | OpenAPI em `/api/docs` | Contrato da API documentado |

### Onde está no código

- Validação env: `backend/src/config/env.validation.ts`
- `ConfigModule.forRoot({ validate })`: `backend/src/app.module.ts`
- Swagger: `backend/src/main.ts` → **http://localhost:3000/api/docs**

### Como usar

1. Suba a API (`npm run start:dev` no `backend`)
2. Abra `/api/docs` no browser **ou** rode requests em `.vscode/distac.http` (REST Client)

---

## 3. O que isso padroniza no clone

| Antes | Depois |
|-------|--------|
| Cada dev formata diferente | Prettier + settings do workspace |
| Env quebrado só em runtime profundo | Config valida no boot |
| API “só no código” | Swagger + arquivo `.http` |
| Extensões no achismo | `extensions.json` recomenda o kit Distac |

Ao clonar para um novo cliente: mantenha `.vscode/` (ou adapte o `.http`), ConfigModule e Swagger; troque título/tags do Swagger.

---

## 4. Separação de responsabilidades

| Camada | Onde | Para quem |
|--------|------|-----------|
| Rules / Skills | `.cursor/` | Agente Cursor |
| Plugins / settings / `.http` | `.vscode/` | Onboarding humano |
| Padronização API | Config + Swagger no código | Todo clone |

Ver: [`DOMINIO-TECNICO.md`](DOMINIO-TECNICO.md) · [`USAR-COMO-BASE.md`](USAR-COMO-BASE.md)
