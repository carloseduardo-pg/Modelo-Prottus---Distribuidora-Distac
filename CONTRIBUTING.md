# Contribuindo neste modelo Prottus (Distac)

Uso interno da Prottus. Este repo é **produto Distac** e **base** para novos clientes web.

## Antes de mudar código

1. Ler [`docs/projeto/DOMINIO-TECNICO.md`](docs/projeto/DOMINIO-TECNICO.md) (tech lead).  
2. Segurança / escala: [`seguranca.md`](docs/projeto/seguranca.md) · [`escalabilidade.md`](docs/projeto/escalabilidade.md).  
3. Reuso: [`USAR-COMO-BASE.md`](docs/projeto/USAR-COMO-BASE.md).  
4. **Não editar** `docs/prottus/` nem enfraquecer JWT httpOnly / audit / paginação sem decisão documentada.

## Checklist rápido de PR

- [ ] Lint: `npm run lint` (raiz) ou lint em `backend`/`frontend`
- [ ] Unitários: `npm run test` (backend)
- [ ] Se API no ar: `npm run test:smoke`
- [ ] Sem secrets no git
- [ ] JSDoc + `FUNCTIONS.md` se export público novo
- [ ] Migration: nome descreve schema (nunca nome de pessoa); revisar SQL / `prisma migrate diff`

## Agente Cursor

Rules em `.cursor/rules/`; skills em `.cursor/skills/` — ver [`.cursor/README.md`](.cursor/README.md).
