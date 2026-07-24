# Usar o Distac como base Prottus

Este repositório **é** a base. Não existe pasta separada de “template vazio”.

Metodologia empresa (não alterar): [`../prottus/`](../prottus/).  
O que se customiza por cliente: tudo em `docs/projeto/`, código de domínio, marca e schema.

---

## Passos

1. **Copiar** o mono-repo (ou branch a partir dele).
2. **Renomear** contexto: cliente, sistema, logo (`imagens/`), tokens em `design-system.md` + `frontend/src/styles/`.
3. **Atualizar** `.cursor/rules/projeto/` (uma rule do cliente, como `distac.mdc`).
4. **Substituir domínio** em `backend/prisma/schema.prisma`, migrations, seed, módulos Nest e páginas React.
5. **Manter** (não remover sem decisão explícita):
   - Auth JWT httpOnly + Helmet + rate limit
   - Paginação e endpoints de summary/options quando fizer sentido
   - Pasta `database/` (scripts + SQL de triggers/audit)
   - `tests/load` (ajustar cenários ao domínio)
   - Docs `seguranca.md`, `escalabilidade.md`, `DOMINIO-TECNICO.md`
   - `.cursor/skills/` (adaptar skills `distac-*`) e `.cursor/rules/prottus/`
6. **Limpar** seed/login de exemplo; nunca publicar senhas reais.
7. **Rodar** setup → migrate → check → API → UI → `node tests/load/run-node.mjs smoke`.

---

## O que muda vs o que fica

| Costuma mudar | Costuma ficar |
|---------------|---------------|
| Tabelas de negócio | Forma de auth (cookies httpOnly) |
| Telas / marca | Estrutura `frontend` / `backend` / `database` / `tests` |
| Brief e requisitos | `docs/prottus/` e rules Prottus |
| Seed e CNPJs de exemplo | Anonimização em `audit_log` |
| Nomes de módulos Nest | Convenção de triggers `fn_` / `trg_` |
| Rule/skills `distac-*` | Pilares de skills (local-run, security, tests) |

---

## Critério de pronto (base reutilizável)

- [ ] Login seguro documentado
- [ ] CRUD do domínio com paginação
- [ ] Triggers/audit aplicados e documentados
- [ ] Segurança e escalabilidade linkados no README do novo projeto
- [ ] Teste de smoke/carga executável
