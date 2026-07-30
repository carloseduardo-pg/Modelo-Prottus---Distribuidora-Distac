# Stress tests — Distac API

Suite de carga/estresse contra a API NestJS (cookies JWT).

## Pré-requisitos

1. PostgreSQL com database `distac` (migrate + seed)
2. Backend rodando em `http://localhost:3000/api` (`npm run start:dev`)

## Perfis

| Comando | Uso |
|---------|-----|
| `npm run test:stress:smoke` | Validação rápida (baixa carga) |
| `npm run test:stress` | Padrão (20 VU × 200 req) |
| `npm run test:stress:heavy` | Carga alta (50 VU × 1000 req) |
| `npm run test:stress:login` | Só flood de login |
| `npm run test:stress:read` | Só listagens autenticadas |
| `npm run test:stress:orders` | Só criação de pedidos |
| `npm run test:stress:mixed` | Mix leitura/escrita |

## Cenários

1. **read-storm** — `GET` em clients/products/orders/users/me
2. **order-writes** — `POST /orders` com itens embutidos
3. **mixed-workload** — 70% leitura, 20% `/auth/me`, 10% create order
4. **login-flood** — `POST /auth/login` concorrente (roda por último; 429 do throttler é esperado)

> Nota: o `ThrottlerGuard` global (300 req/min) pode responder `429` sob carga. Nos cenários autenticados isso é tratado como esperado (não falha de domínio). O flood de login roda por último para não esgotar a cota dos demais.

## Critérios (soft fail)

- Taxa de erro de aplicação (excluindo `429`) ≤ `STRESS_MAX_ERROR_RATE` (default `0.05`)
- Latência p95 ≤ `STRESS_MAX_P95_MS` (default `1500`, maior em writes/login)
- `429` do ThrottlerGuard é reportado como `throttled` (overload tratado), não como falha

## Variáveis de ambiente

| Nome | Default |
|------|---------|
| `STRESS_BASE_URL` | `http://localhost:3000/api` |
| `STRESS_EMAIL` | `admin@distac.com.br` |
| `STRESS_PASSWORD` | `Admin@123` |
| `STRESS_CONCURRENCY` | `20` |
| `STRESS_REQUESTS` | `200` |
| `STRESS_DURATION_MS` | (opcional; se setado, ignora contagem fixa) |
| `STRESS_MAX_ERROR_RATE` | `0.05` |
| `STRESS_MAX_P95_MS` | `1500` |
| `STRESS_LOGIN_RETRIES` | `8` (retry com espera se login setup receber 429) |
| `STRESS_SKIP_LOGIN_FLOOD` | `1` para pular o flood de login |

## Rate limit

- Global: 300 req/min
- Login (`POST /auth/login`): **10 req/min**

Se uma execução anterior esgotou o login, o harness **espera e retenta** automaticamente. Para não consumir a cota no fim do heavy:

```bash
STRESS_SKIP_LOGIN_FLOOD=1 npm run test:stress:heavy
```

```bash
cd backend
npm run start:dev   # outro terminal
npm run test:stress:smoke
```
