# Testes Distac — carga e segurança

Parte da **base Prottus**: comprovar RNF de segurança e baseline de escala.  
Docs: [`docs/projeto/seguranca.md`](../docs/projeto/seguranca.md) · [`docs/projeto/escalabilidade.md`](../docs/projeto/escalabilidade.md)

## Pré-requisito

```bash
bash database/scripts/check.sh
cd backend && npm run start:dev
```

## Rodar

```bash
# raiz do projeto
node tests/load/run-node.mjs

VUS=50 DURATION_MS=20000 node tests/load/run-node.mjs
```

Verifica:

1. Sem cookie → **401**
2. Helmet → `x-content-type-options: nosniff`
3. Carga autenticada (summary + listagens paginadas)
4. Login em excesso → **429**

Se o login estiver em cooldown, aguarde ~60s.

## Resultado de referência (2026-07-23)

| Item | Resultado |
|------|-----------|
| Auth sem cookie | **401** |
| Helmet | **nosniff** |
| Carga | 20 VUs · 12s · **0 fail** · p95 ≈ 156ms |
| Rate limit login | **429** |

## Opcional: k6

```bash
k6 run tests/load/auth-crud.js
```

## Hardening coberto pelo teste

| Item | Status |
|------|--------|
| Helmet | sim |
| Rate limit global + login | sim |
| JWT obrigatório no `.env` | sim |
| Paginação | sim |
| Dashboard summary | sim |
| Login sem senha pré-preenchida | sim |
