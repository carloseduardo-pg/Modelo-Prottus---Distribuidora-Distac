# Testes Distac — carga e segurança (3 níveis)

Parte da **base Prottus**. Docs: [`docs/projeto/seguranca.md`](../docs/projeto/seguranca.md) · [`docs/projeto/escalabilidade.md`](../docs/projeto/escalabilidade.md)

## Pré-requisito

```bash
bash database/scripts/check.sh
cd backend && npm run start:dev
```

## Níveis

| Nível | Para quê | VUs | Duração | O que espera |
|-------|----------|-----|---------|--------------|
| **smoke** | Gate rápido | 5 | 5s | Segurança + pouca carga |
| **normal** | Baseline do dia a dia | 20 | 12s | Uso típico autenticado |
| **heavy** | Stress | 50 | 25s | Muitos 429 na API = proteção OK |

## Como rodar (raiz do projeto)

```bash
node tests/load/run-node.mjs smoke
node tests/load/run-node.mjs normal    # padrão se omitir o nível
node tests/load/run-node.mjs heavy
```

Overrides opcionais:

```bash
LEVEL=heavy node tests/load/run-node.mjs
VUS=30 DURATION_MS=15000 node tests/load/run-node.mjs normal
```

## O que o terminal mostra

1. Cabeçalho com nível, VUs, duração e rotas  
2. **0/4** Health  
3. **1/4** Segurança (401 sem cookie + Helmet)  
4. **2/4** Sessões JWT  
5. **3/4** Carga (totais, latência p50/p95/p99, por rota, req/s)  
6. **4/4** Rate limit no login (429)  
7. **Resumo final** tabela PASS/FAIL + veredito `OK` / `FALHOU`

`429` na API sob carga **não** conta como falha de aplicação (é o rate limit).  
`fail` = HTTP de erro que não é 429 (ex.: 500).

Se o login estiver em cooldown, aguarde ~60s e rode de novo (comece por `smoke`).

**Heavy logo após smoke/normal:** o IP pode receber **429** no check de auth (rate limit residual). O script aguarda `Retry-After` e, se ainda houver 429, **não falha** — desde que a API não devolva **200** sem cookie (sem vazamento).

## Opcional: k6

```bash
k6 run tests/load/auth-crud.js
```
