# Como iniciar um novo projeto com este repositório

Este repositório é o **modelo web Prottus** (exemplo Distac): metodologia da empresa **+** fundação técnica segura (Nest/React/Prisma/PostgreSQL).

## Fundação técnica desta base (não remover no kickoff)

Antes (ou depois) dos caminhos A/B de documentação abaixo, preserve estes pilares no código:

| Pilar | Onde |
|-------|------|
| Domínio em inglês (`users`, `clients`, `products`, `orders`, `order_items`) + UI em português | Prisma + Nest + React |
| JWT em cookies httpOnly + `JwtAuthGuard` **global** + `@Public()` | `backend/src/auth/` |
| Validação de usuário **ativo** no JwtStrategy | `backend/src/auth/jwt.strategy.ts` |
| Helmet, ValidationPipe, Throttler, CORS, prefixo `/api`, Swagger | `backend/src/main.ts` |
| Config validada no boot (`validateEnv`) | `backend/src/config/` |
| `orders.total` / `line_total` via **triggers** + `audit_log` | `database/` + migration init |
| Dashboard summary + health | `dashboard/`, `health.controller.ts` |
| Stress tests | `backend/stress/` (`npm run test:stress:smoke`) |
| Skills Cursor | `.cursor/skills/` |
| Fluxo da aplicação (modelo) | `docs/projeto/FLUXO-APLICACAO.md` |

### Subir a stack local

```bash
npm run install:all
npm run setup          # DB + migrate + seed (reset se o banco ainda for o schema antigo PT)
npm run dev:api        # http://localhost:3000/api  · Swagger /api/docs
npm run dev:web        # http://localhost:5173
```

Login seed: `vendedor@distac.local` / `distac123`

Se o Postgres local ainda tiver tabelas portuguesas (`cliente`, `pedido`…), **recrie o database** e rode `npm run setup` de novo — a migration limpa é só domínio inglês.

---

Este arquivo ensina **na prática** como usar o **Padrão Prottus** como base de qualquer projeto da empresa.

Na Prottus o mais comum é já existir material de entrevistas e documentação **antes** do código. Por isso há **dois caminhos** depois do Passo 1:

| Caminho | Quando usar | Trabalho do usuário |
|---------|-------------|---------------------|
| **A — Documentação base** (recomendado) | Você tem pasta com briefs, DOP, atas, specs técnicas, marca… | Sobe os arquivos + cola 2–3 prompts; responde só o que o agente **não** achou |
| **B — Manual** | Ainda não há material escrito; você dita tudo no chat | Preenche cada `⟦ … ⟧` nos prompts dos passos B2–B10 |

Os dois caminhos terminam no **mesmo Gate** (Passo final) antes de liberar código.

---

## Como usar este guia

1. Faça o **Passo 1** (preparar o repo).
2. Escolha **Caminho A** ou **Caminho B**.
3. Não peça código de aplicação antes do **Gate (passo final)**.
4. Não edite `docs/prottus/` nem `.cursor/rules/prottus/` no kickoff.

Legenda nos prompts:

| Marcação | Significado |
|----------|-------------|
| `⟦ … ⟧` | Você digita / completa à mão antes de colar no Cursor |
| Resto do texto | Deixe como está |

Lista curta: [docs/prottus/CHECKLIST-NOVO-PROJETO.md](docs/prottus/CHECKLIST-NOVO-PROJETO.md)

---

## Passo 1 — Preparar o repositório do cliente

Na pasta do **novo** repositório do cliente:

```bash
# Ajuste o caminho para onde você clonou/baixou este padrão Prottus
cp -R "/caminho/para/Padrao-de-Desenvolvimento---Cursor---Prottus/docs" .
cp -R "/caminho/para/Padrao-de-Desenvolvimento---Cursor---Prottus/.cursor" .
cp "/caminho/para/Padrao-de-Desenvolvimento---Cursor---Prottus/.gitignore" .gitignore
mkdir -p imagens
mkdir -p docs/projeto/documentacao-base
```

Depois:

1. Coloque o logo em `imagens/` se já tiver (senão siga e registre “logo pendente” depois).
2. Abra **a pasta do cliente** no Cursor.
3. Confira: `docs/projeto/`, `docs/projeto/documentacao-base/`, `docs/prottus/`, `.cursor/rules/projeto/`, `.cursor/rules/prottus/`.

**Pronto quando:** Cursor aberto na raiz do projeto do cliente.

---

# Escolha o caminho

```
Tem material de descoberta / entrevistas / specs já escritos?
   ├── SIM  →  Caminho A (abaixo)
   └── NÃO  →  Caminho B (mais abaixo)
```

---

# CAMINHO A — Documentação base (recomendado)

Ideia: você **sobe** os documentos que a empresa já tem; o agente **preenche** toda a camada `docs/projeto/` (+ regras Cursor, agent, README do produto); no fim ele **só pergunta** o que for obrigatório e não estiver nos arquivos.

## Passo A1 — Subir a pasta de documentos

1. Copie para `docs/projeto/documentacao-base/` **todos** os materiais disponíveis (Markdown, texto, PDFs legíveis, subpastas ok).
2. Leia o que entra / não entra em [docs/projeto/documentacao-base/README.md](docs/projeto/documentacao-base/README.md).
3. Confirme que há pelo menos algo de **negócio** (contexto/requisitos/entrevistas). Stack e marca ajudam, mas se faltar o agente vai perguntar no A3.

Exemplos do que costuma existir na Prottus antes do kickoff:

- Brief / proposta comercial  
- Atas e roteiros DOP/FAROL  
- Lista de requisitos  
- Decisões de stack / infra  
- Glossário ou mapa de domínio  
- Guia de marca / hex / logo  

**Pronto para A2 quando:** os arquivos já estão em `docs/projeto/documentacao-base/` (além do README da pasta).

---

## Passo A2 — Prompt mestre: documentar a partir da pasta

Copie, preencha só os `⟦ … ⟧` mínimos e cole no Cursor:

```text
KICKOFF PROTTUS — CAMINHO A (documentação a partir da pasta base)

Contexto:
- Este repositório usa o Padrão Prottus.
- Já copiei o pacote padrão. NÃO altere docs/prottus/ nem .cursor/rules/prottus/.
- NÃO escreva código de aplicação nem scaffold neste passo.

Fontes (leia TUDO recursivamente):
- docs/projeto/documentacao-base/

Identidade mínima que eu já sei (complete o que souber; se estiver nos docs, pode confirmar):
- Cliente: ⟦nome do cliente ou "está nos documentos"⟧
- Sistema/produto: ⟦nome ou "está nos documentos"⟧
- Meu login Cursor (para o agent): ⟦ex.: joao.silva⟧
- Data de hoje (AAAA-MM-DD): ⟦data⟧
- Slug da regra do projeto (minúsculo, sem espaço): ⟦ex.: acme⟧

Sua missão:
1) Inventariar os arquivos em documentacao-base/ (liste no chat: nome + 1 linha do que contém).
2) Preencher/reescrever COMPLETAMENTE, sem placeholders {CLIENTE} / ___ / ... :
   - docs/projeto/contexto.md
   - docs/projeto/especificacoes.md
   - docs/projeto/design-system.md
   - docs/projeto/mapa-entidades.md
   - docs/projeto/requisitos/requisito.md
   - docs/projeto/modulos/STATUS_PROTOTIPO.md
   - docs/projeto/modulos/README.md
3) Criar/atualizar:
   - .cursor/rules/projeto/⟦slug⟧.mdc (alwaysApply: true; remova cliente.mdc genérico se sobrar)
   - .cursor/agents/cursor-⟦login⟧.md (sessão "Kickoff documental via documentacao-base")
   - README.md da RAIZ como README do PRODUTO (não o guia do padrão Prottus)
   - Ajustar .gitignore à stack encontrada (ou "A definir")
4) Regras de fidelidade:
   - Use APENAS o que estiver nos documentos base (+ identidade mínima acima).
   - NÃO invente stack, entidades, cores, integrações ou regras de negócio.
   - O que não aparecer nas fontes: marque explicitamente "A definir" no arquivo correspondente.
   - Hipóteses de domínio (se inevitáveis): só em "Decisões em aberto", rotuladas como hipótese.
   - Mantenha RNFs padrão Prottus em requisitos (docs de exports; UI sem emojis / Icon).
5) Ao terminar a escrita dos arquivos, NÃO libere código.
   Entregue no chat uma seção exatamente assim:

### Lacunas obrigatórias
Lista NUMERADA só do que é OBRIGATÓRIO para o Gate e ainda está "A definir" ou ausente.
Para cada item: (a) o que falta, (b) em qual arquivo do padrão isso entra, (c) por que é obrigatório.
Se não houver lacuna obrigatória, escreva: "Nenhuma lacuna obrigatória."

### Lacunas opcionais / DOP
Itens que podem esperar entrevista, sem bloquear o Gate.

Não faça perguntas misturadas no meio da geração dos arquivos — primeiro documente; depois a lista de lacunas.
```

**Concluído quando:** os arquivos de `docs/projeto/` existem preenchidos **e** o chat mostra `### Lacunas obrigatórias`.

---

## Passo A3 — Responder só o que o agente não encontrou

Se o A2 terminou com **“Nenhuma lacuna obrigatória”**, pule para o **Passo A4** (ou direto ao Gate se A2 já fechou regras/agent/README).

Se houver lacunas, copie o prompt abaixo, **numere as respostas** na mesma ordem da lista do agente e cole:

```text
KICKOFF PROTTUS — respostas às lacunas obrigatórias

Use as respostas abaixo para ATUALIZAR os arquivos de docs/projeto/ (e resumos em
.cursor/rules/projeto/ e .cursor/agents/ se necessário).
Não invente além do que eu responder. Não escreva código. Não altere docs/prottus/.

Respostas (mesma numeração das "Lacunas obrigatórias"):
1. ⟦resposta da lacuna 1⟧
2. ⟦resposta da lacuna 2⟧
3. ⟦... continue até cobrir todas⟧

Ao terminar:
- Remova "A definir" dos itens que eu respondí.
- Atualize o agent com o que foi resolvido.
- Mostre de novo "### Lacunas obrigatórias" (deve ficar vazia ou só o que eu ainda não souber).
- Se ainda faltar algo obrigatório que eu não saiba, mantenha na lista — não invente.
```

Repita A3 até **não restar lacuna obrigatória** (ou até você decidir registrar formalmente “A definir” aceito pela equipe — ex.: CI/CD futuro — desde que stack mínima + contexto + domínio inicial estejam ok).

**Mínimo que normalmente bloqueia o Gate se estiver ausente:**

- Nome do cliente e do sistema  
- Objetivo / usuários / escopo  
- Frontend, backend, banco (ou decisão explícita)  
- Auth (ou “A definir” consciente aceito pelo time)  
- Visão de domínio + entidades/áreas iniciais  
- Marca: ao menos primária **ou** “logo/cores pendentes” documentado  

---

## Passo A4 — Conferência rápida do Caminho A

- [ ] `documentacao-base/` contém os materiais usados  
- [ ] `docs/projeto/*` preenchidos (sem `{CLIENTE}` / `___` críticos)  
- [ ] `.cursor/rules/projeto/{slug}.mdc` existe  
- [ ] `.cursor/agents/cursor-{login}.md` existe  
- [ ] README do **produto** na raiz do repo do cliente  
- [ ] Lacunas obrigatórias = nenhuma (ou só “A definir” conscientes alinhados com o time)  
- [ ] `docs/prottus/` e `.cursor/rules/prottus/` intactos  

→ Vá para o **Passo final — Gate**.

---

# CAMINHO B — Manual (campo a campo)

Use se **não** houver pasta de documentos. Em cada passo: copie o prompt, preencha os `⟦ … ⟧`, cole no Cursor.

## Passo B2 — Contexto (`docs/projeto/contexto.md`)

```text
Preencha docs/projeto/contexto.md com os dados abaixo.
Não altere docs/prottus/ nem .cursor/rules/prottus/.
Não escreva código. Remova placeholders ({CLIENTE}, ..., ___).
Tecnologias não entram neste arquivo (vão em especificacoes.md).
Mantenha a tabela "Onde ler o quê" com os links do template.

Cliente: ⟦nome da empresa/cliente⟧
Sistema: ⟦nome do produto/sistema⟧

Objetivo (2–4 frases — o que faz, para quem, qual problema resolve):
⟦escreva aqui⟧

Usuários principais:
- ⟦papel 1⟧: ⟦o que essa pessoa faz no sistema⟧
- ⟦papel 2⟧: ⟦o que essa pessoa faz no sistema⟧
- ⟦papel 3 ou "nenhum outro"⟧: ⟦...⟧

Escopo inicial (entra na 1ª entrega):
- ⟦item 1⟧
- ⟦item 2⟧
- ⟦item 3⟧

Fora de escopo (não entra agora):
- ⟦item 1⟧
- ⟦item 2⟧
```

---

## Passo B3 — Especificações (`docs/projeto/especificacoes.md`)

```text
Preencha docs/projeto/especificacoes.md com os dados abaixo.
Não altere docs/prottus/. Não escreva código nem scaffold.
Se algo for desconhecido, escreva exatamente "A definir" — não invente.
Título com o nome real do cliente. Preencha as seções 1 a 6 do template.

Cliente: ⟦nome do cliente⟧

Arquitetura:
- Estilo: ⟦monólito | microserviços | serverless | outro: descreva⟧
- Repositório: ⟦mono-repo | multi-repo⟧
- Docker/containers: ⟦sim | não | parcial — detalhe⟧

Stack:
- Frontend/client: ⟦ex.: React + Vite + TypeScript⟧
- Backend/API: ⟦ex.: NestJS | FastAPI | Laravel⟧
- Banco de dados: ⟦ex.: PostgreSQL⟧
- Filas/cache: ⟦ex.: Redis | nenhum⟧
- Linguagem(ns): ⟦ex.: TypeScript, Python⟧

Infra e deploy:
- Ambientes: ⟦local / homolog / prod — ou ajuste⟧
- Hospedagem: ⟦VPS | Vercel | AWS | outro: descreva⟧
- CI/CD: ⟦ferramenta ou "A definir"⟧
- Domínios/TLS: ⟦domínio ou "A definir"⟧

Auth e integrações:
- Autenticação: ⟦ex.: JWT próprio | Auth0 | sessão cookie⟧
- Integrações externas: ⟦liste ou "nenhuma ainda"⟧

Convenções deste repo:
- Estrutura de pastas: ⟦descreva ou "seguir padrão da stack no scaffold"⟧
- Comandos dev/build/teste: ⟦liste ou "definir no scaffold"⟧
- Índice de docs de código: ⟦ex.: FUNCTIONS.md na raiz⟧
- Variáveis de ambiente (só NOMES, sem secrets): ⟦ex.: DATABASE_URL, JWT_SECRET⟧

Restrições:
- ⟦restrição 1 ou "nenhuma além da metodologia Prottus"⟧
```

---

## Passo B4 — Marca (`docs/projeto/design-system.md`)

```text
Preencha docs/projeto/design-system.md (marca do CLIENTE).
Não altere docs/prottus/design-system.md.
Não escreva arquivo CSS ainda — só a documentação.
Se hover/active não forem informados, derive da primária e declare isso no doc.
Se uma cor de superfície não for informada, use "A definir".

Cliente: ⟦nome do cliente⟧

Cores da marca:
- Primária: #⟦hex⟧
- Primária hover: #⟦hex ou "derivar da primária"⟧
- Primária active: #⟦hex ou "derivar da primária"⟧
- Secundária: #⟦hex ou "não há"⟧
- Ink/títulos: #⟦hex ou "usar padrão Prottus"⟧

Superfícies:
- Header fundo: #⟦hex⟧
- Header texto: #⟦hex — ex. FFFFFF⟧
- Sidebar fundo: #⟦hex ou "A definir"⟧
- Fundo da página: #⟦hex ou "A definir"⟧

Tipografia:
- Família: ⟦ex.: Inter | fonte do cliente⟧

Assets:
- Logo fonte: ⟦ex.: imagens/logo.svg | "logo pendente"⟧
- Observações de marca: ⟦tom, proibições, referências ou "nenhuma"⟧
```

---

## Passo B5 — Domínio (`docs/projeto/mapa-entidades.md`)

```text
Preencha docs/projeto/mapa-entidades.md com os dados abaixo.
Siga a abordagem de docs/prottus/mapa-entidades.md.
Não invente entidade que eu não citei; se precisar sugerir, coloque em "Decisões em aberto" como hipótese.
Inclua um diagrama mermaid simples só com o que foi informado.
Não escreva código nem migrations.

Cliente: ⟦nome do cliente⟧

Visão do domínio (3–5 linhas):
⟦escreva como o negócio funciona em alto nível⟧

Áreas previstas:
1. Área: ⟦ex.: auth⟧ — responsabilidade: ⟦...⟧ — exemplos de dados: ⟦ex.: user, profile⟧
2. Área: ⟦...⟧ — responsabilidade: ⟦...⟧ — exemplos: ⟦...⟧
3. Área: ⟦... ou "fim"⟧ — responsabilidade: ⟦...⟧ — exemplos: ⟦...⟧

Entidades principais:
1. ⟦NomeEntidade⟧ — papel: ⟦...⟧
2. ⟦NomeEntidade⟧ — papel: ⟦...⟧
3. ⟦NomeEntidade ou "fim"⟧ — papel: ⟦...⟧

Fluxos operacionais principais:
1. ⟦passo a passo do fluxo 1 em linguagem de negócio⟧
2. ⟦fluxo 2 ou "nenhum outro agora"⟧

Decisões em aberto / dúvidas para DOP:
1. ⟦dúvida 1⟧
2. ⟦dúvida 2 ou "nenhuma"⟧
```

---

## Passo B6 — Requisitos (`docs/projeto/requisitos/requisito.md`)

```text
Preencha docs/projeto/requisitos/requisito.md com os dados abaixo.
Mantenha os RNFs padrão Prottus (docs de exports; UI sem emojis / componente Icon) e acrescente os do cliente.
Não invente integrações — use "A descobrir" se for o caso.
Não escreva código.
Prioridade 1 deve ser a fundação documental; em seguida o que o cliente pediu.

Cliente: ⟦nome do cliente⟧
Sistema: ⟦nome do sistema⟧

Visão do sistema (1 parágrafo):
⟦escreva⟧

Operações que a plataforma deve gerenciar (núcleo):
- ⟦operação 1⟧
- ⟦operação 2⟧
- ⟦operação 3⟧

Perguntas que o sistema deve responder (consultas/relatórios):
- ⟦pergunta 1⟧
- ⟦pergunta 2⟧

Requisitos não-funcionais extras do cliente (além da Prottus):
- ⟦ex.: performance X | auditoria | offline — ou "nenhum extra"⟧

Integrações conhecidas:
- ⟦sistema + tipo | ou "A descobrir"⟧

Setores/papéis ainda sem descoberta (DOP pendente):
- ⟦área 1⟧
- ⟦área 2 ou "nenhuma além do núcleo"⟧

Prioridade imediata após a documentação:
⟦o que vem depois do kickoff documental⟧
```

---

## Passo B7 — Status do protótipo

```text
Atualize docs/projeto/modulos/STATUS_PROTOTIPO.md e docs/projeto/modulos/README.md.

Regras:
- Docs Prottus: ok (copiado do padrão)
- Docs projeto: "Preenchido (kickoff)"
- Frontend, Backend, Banco: "Não iniciado"
- Rotas: só o óbvio do escopo como Planejado (ex.: /login). Não invente módulos.
- Não escreva código de aplicação.
- Substitua {CLIENTE} pelo nome real no README de módulos.

Cliente: ⟦nome do cliente⟧
Data (AAAA-MM-DD): ⟦data de hoje⟧
Rotas óbvias do escopo inicial: ⟦ex.: /login, /dashboard | ou só /login⟧
```

---

## Passo B8 — Regra Cursor do projeto

```text
Com base nos arquivos já preenchidos em docs/projeto/, crie a regra Cursor do projeto.

Regras:
- Crie .cursor/rules/projeto/⟦slug-do-cliente⟧.mdc (alwaysApply: true)
- Remova ou substitua .cursor/rules/projeto/cliente.mdc para não ficar regra genérica duplicada
- Resuma contexto, stack (obrigatório), marca e domínio
- Alinhe a stack com docs/projeto/especificacoes.md
- NÃO altere .cursor/rules/prottus/
- NÃO escreva código de aplicação

Cliente: ⟦nome do cliente⟧
Slug do arquivo (sem espaços, minúsculo): ⟦ex.: acme⟧
```

---

## Passo B9 — Agent pessoal

```text
Crie .cursor/agents/cursor-⟦seu-login⟧.md a partir de .cursor/agents/TEMPLATE.md.

Preencha:
- Repositório/sistema: ⟦nome do sistema⟧
- Última atualização: ⟦AAAA-MM-DD⟧
- Snapshot: Cliente ⟦nome⟧ | Status: Fundação documental concluída — aguardando liberação para código
- Histórico: uma sessão de hoje titulada "Kickoff documental" com o que foi preenchido em docs/projeto/
- Pendências: tudo que ficou "A definir" ou pendente de DOP
- Não escreva código de aplicação

Seu login (mesmo do nome do arquivo): ⟦ex.: joao.silva⟧
```

---

## Passo B10 — README do produto e .gitignore

> No repositório **deste padrão**, não substitua o README do padrão. Este passo vale no repositório **do cliente**.

```text
Crie/atualize o README.md da raiz como README do PRODUTO (não como guia do padrão Prottus).

Inclua:
- Nome do sistema: ⟦nome⟧
- Cliente: ⟦nome⟧
- Objetivo em até 3 linhas (baseado em docs/projeto/contexto.md)
- Links para docs/projeto/ e docs/prottus/
- Seção "Como rodar": indicar que o scaffold virá após o gate; detalhes em especificacoes.md

Ajuste .gitignore conforme a stack em docs/projeto/especificacoes.md.
Não faça scaffold de código ainda.
```

→ Vá para o **Passo final — Gate**.

---

# Passo final — Gate de liberação (Caminho A ou B)

### Checklist

**Documentação do projeto**

- [ ] `docs/projeto/contexto.md`
- [ ] `docs/projeto/especificacoes.md`
- [ ] `docs/projeto/design-system.md`
- [ ] `docs/projeto/mapa-entidades.md`
- [ ] `docs/projeto/requisitos/requisito.md`
- [ ] `docs/projeto/modulos/STATUS_PROTOTIPO.md`
- [ ] `docs/projeto/modulos/README.md` sem `{CLIENTE}`

**Cursor**

- [ ] `.cursor/rules/projeto/{slug}.mdc` preenchido
- [ ] `.cursor/rules/prottus/` intacto
- [ ] `.cursor/agents/cursor-{login}.md` criado
- [ ] `docs/prottus/` intacto

**Extras**

- [ ] Logo em `imagens/` ou “logo pendente” documentado
- [ ] `.gitignore` alinhado à stack (ou “A definir” consciente)
- [ ] Sem `{CLIENTE}` / `___` críticos nos docs do projeto
- [ ] (Caminho A) fontes em `docs/projeto/documentacao-base/`

Se faltar item, volte ao caminho escolhido. **Não** cole o prompt abaixo.

### Prompt de liberação

```text
GATE DE LIBERAÇÃO PROTTUS CONCLUÍDO.

Validei docs/projeto/ e .cursor/rules/projeto/ preenchidos no kickoff.
docs/prottus/ e .cursor/rules/prottus/ permanecem intactos.

Pode iniciar o scaffold seguindo estritamente docs/projeto/especificacoes.md e as regras Prottus.

Primeira tarefa: estrutura de pastas + mínimo rodável (install/dev) das especificações,
sem regras de negócio além do necessário para o app subir.

Ao terminar: atualize docs/projeto/modulos/STATUS_PROTOTIPO.md
e registre a sessão em .cursor/agents/cursor-⟦seu-login⟧.md.
```

**Antes:** só fundação documental. **Depois:** pode desenvolver.

---

## Depois que o projeto estiver documentado

No repositório do **cliente**, quando o Gate passar:

| Artefato | O que fazer |
|----------|-------------|
| `docs/projeto/*` preenchidos | Viram a fonte da verdade do cliente — manter atualizados |
| `docs/projeto/documentacao-base/` | Pode ficar como histórico da descoberta |
| `COMO-INICIAR-UM-NOVO-PROJETO.md` | Pode **remover** do repo do cliente (é guia do padrão, não do produto) |
| README da raiz | Deve ser o do **produto**, não o deste padrão |
| Placeholders / exemplos de prompt | Não devem restar nos docs do projeto |

O pacote mestre (este repositório) **mantém** o guia e os templates para o próximo kickoff.

---

## Mapa rápido

| Etapa | Caminho A | Caminho B |
|-------|-----------|-----------|
| Preparar repo | Passo 1 | Passo 1 |
| Entrada | Subir `documentacao-base/` | Respostas manuais nos prompts |
| Documentar | Prompt A2 (+ A3 se faltar) | Passos B2–B10 |
| Liberar código | Gate | Gate |

| Arquivo do projeto | Preenchido por |
|--------------------|----------------|
| `contexto.md` | A2/A3 ou B2 |
| `especificacoes.md` | A2/A3 ou B3 |
| `design-system.md` | A2/A3 ou B4 |
| `mapa-entidades.md` | A2/A3 ou B5 |
| `requisitos/requisito.md` | A2/A3 ou B6 |
| `modulos/*` | A2 ou B7 |
| `.cursor/rules/projeto/*.mdc` | A2 ou B8 |
| `.cursor/agents/cursor-*.md` | A2 ou B9 |
| README produto | A2 ou B10 |

---

## O que este repositório já traz

| Pasta | Conteúdo | No kickoff |
|-------|----------|------------|
| `docs/prottus/` | Metodologia, DS Prottus, modelagem | Não editar |
| `.cursor/rules/prottus/` | Processo e qualidade | Não editar |
| `docs/projeto/` | Templates do cliente | Preencher (A ou B) |
| `docs/projeto/documentacao-base/` | Entrada dos materiais de descoberta | Encher no Caminho A |
| `.cursor/rules/projeto/` | Regra do cliente | Adaptar |

Visão geral: [README.md](README.md)  
Checklist: [docs/prottus/CHECKLIST-NOVO-PROJETO.md](docs/prottus/CHECKLIST-NOVO-PROJETO.md)