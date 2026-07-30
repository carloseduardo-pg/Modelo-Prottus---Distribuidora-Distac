/**
 * Distac — teste de carga autenticado (k6)
 *
 * Instalar: https://k6.io/docs/get-started/installation/
 * Rodar (API no ar):
 *   k6 run tests/load/auth-crud.js
 *   k6 run -e VUS=50 -e DURATION=30s tests/load/auth-crud.js
 *
 * Login ocorre no setup (1x); VUs reutilizam cookie via jar.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://127.0.0.1:3000/api';
const EMAIL = __ENV.EMAIL || 'vendedor@distac.local';
const PASS = __ENV.PASS || 'distac123';

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: Number(__ENV.VUS || 20),
      duration: __ENV.DURATION || '20s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

export function setup() {
  const res = http.post(
    `${BASE}/auth/login`,
    JSON.stringify({ email: EMAIL, password: PASS }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(res, { 'setup login': (r) => r.status === 200 });
  return { cookies: res.cookies };
}

export default function (data) {
  const jar = http.cookieJar();
  if (data && data.cookies) {
    for (const [name, values] of Object.entries(data.cookies)) {
      for (const v of values) {
        jar.set(BASE.replace('/api', ''), name, v.value);
      }
    }
  }

  const summary = http.get(`${BASE}/dashboard/summary`);
  check(summary, { 'summary 200': (r) => r.status === 200 });

  const clientes = http.get(`${BASE}/clients?page=1&pageSize=20`);
  check(clientes, { 'clientes 200': (r) => r.status === 200 });

  const produtos = http.get(`${BASE}/products?page=1&pageSize=20`);
  check(produtos, { 'produtos 200': (r) => r.status === 200 });

  const pedidos = http.get(`${BASE}/orders?page=1&pageSize=20`);
  check(pedidos, { 'pedidos 200': (r) => r.status === 200 });

  sleep(0.2);
}
