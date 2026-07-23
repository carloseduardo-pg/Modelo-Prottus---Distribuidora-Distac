#!/usr/bin/env node
/**
 * Distac — carga e segurança (Node, sem k6 obrigatório)
 * Uso: node tests/load/run-node.mjs
 *      VUS=50 DURATION_MS=20000 node tests/load/run-node.mjs
 *
 * Login é feito 1x por sessão (respeita rate limit); a carga fica nas listagens.
 */
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000/api';
const EMAIL = process.env.EMAIL || 'vendedor@distac.local';
const PASS = process.env.PASS || 'distac123';
const VUS = Number(process.env.VUS || 20);
const DURATION_MS = Number(process.env.DURATION_MS || 12000);

function parseCookies(res) {
  const raw = res.headers.getSetCookie?.() || [];
  if (raw.length) {
    return raw.map((c) => c.split(';')[0]).join('; ');
  }
  const single = res.headers.get('set-cookie');
  if (!single) return '';
  return single
    .split(/,(?=\s*\w+=)/)
    .map((c) => c.split(';')[0].trim())
    .join('; ');
}

async function login() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const cookie = parseCookies(res);
  return { status: res.status, cookie };
}

async function authedGet(path, cookie) {
  const t0 = performance.now();
  const res = await fetch(`${BASE}${path}`, {
    headers: { Cookie: cookie },
  });
  return { status: res.status, ms: performance.now() - t0 };
}

async function worker(stopAt, stats, cookie) {
  while (Date.now() < stopAt) {
    for (const path of [
      '/dashboard/summary',
      '/clientes?page=1&pageSize=20',
      '/produtos?page=1&pageSize=20',
      '/pedidos?page=1&pageSize=20',
    ]) {
      if (Date.now() >= stopAt) break;
      const r = await authedGet(path, cookie);
      stats.api.total += 1;
      stats.api.latencies.push(r.ms);
      if (r.status === 200) stats.api.ok += 1;
      else if (r.status === 429) stats.api.throttled += 1;
      else stats.api.fail += 1;
    }
    await sleep(50);
  }
}

function percentile(arr, p) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const i = Math.min(s.length - 1, Math.floor((p / 100) * s.length));
  return s[i];
}

async function acquireSessions(count) {
  const cookies = [];
  let attempts = 0;
  while (cookies.length < count && attempts < count * 10) {
    attempts += 1;
    const { status, cookie } = await login();
    if ((status === 200 || status === 201) && cookie) {
      cookies.push(cookie);
      await sleep(100);
      continue;
    }
    if (status === 429) {
      await sleep(1000);
      continue;
    }
    await sleep(300);
  }
  return cookies;
}

async function main() {
  console.log(`==> Distac load Node  VUS=${VUS} duration=${DURATION_MS}ms`);
  console.log(`    BASE=${BASE}`);

  const health = await fetch(`${BASE}/health`);
  if (!health.ok) {
    console.error('API fora do ar. Suba: cd backend && npm run start:dev');
    process.exit(1);
  }

  console.log('\n==> Segurança (antes da carga)');
  const noAuth = await fetch(`${BASE}/clientes`);
  console.log(`GET /clientes sem cookie → ${noAuth.status} (esperado 401)`);
  if (noAuth.status !== 401) {
    console.error('FAIL: rota protegida não retornou 401');
    process.exit(1);
  }
  const h = await fetch(`${BASE}/health`);
  const nosniff = h.headers.get('x-content-type-options');
  console.log(`Helmet: x-content-type-options=${nosniff}`);
  if (nosniff !== 'nosniff') {
    console.error('FAIL: Helmet não aplicou x-content-type-options');
    process.exit(1);
  }

  console.log('\n==> Obtendo sessões...');
  const sessionBudget = Math.min(VUS, 5);
  const cookies = await acquireSessions(sessionBudget);
  if (!cookies.length) {
    console.error(
      'FAIL: não autenticou. Aguarde 60s (rate limit login) e tente de novo.',
    );
    process.exit(1);
  }
  console.log(`Sessões OK: ${cookies.length}`);

  const stats = {
    api: { total: 0, ok: 0, fail: 0, throttled: 0, latencies: [] },
  };

  const stopAt = Date.now() + DURATION_MS;
  await Promise.all(
    Array.from({ length: VUS }, (_, i) =>
      worker(stopAt, stats, cookies[i % cookies.length]),
    ),
  );

  const lat = stats.api.latencies;
  console.log('\n==> Resultado carga');
  console.log(
    `API: total=${stats.api.total} ok=${stats.api.ok} fail=${stats.api.fail} throttled=${stats.api.throttled}`,
  );
  console.log(
    `Latency ms: p50=${percentile(lat, 50).toFixed(0)} p95=${percentile(lat, 95).toFixed(0)} max=${Math.max(0, ...lat).toFixed(0)}`,
  );

  console.log('\n==> Rate limit no login');
  let throttled = 0;
  for (let i = 0; i < 15; i++) {
    const r = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'x@x.com', password: 'errada1' }),
    });
    if (r.status === 429) throttled += 1;
  }
  console.log(`Login inválido x15 → 429 count=${throttled}`);
  if (throttled < 1) {
    console.error('FAIL: rate limit de login não disparou');
    process.exit(1);
  }

  const failRate =
    stats.api.total === 0 ? 1 : stats.api.fail / stats.api.total;
  if (stats.api.total === 0 || failRate > 0.1) {
    console.error('FAIL: taxa de erro API > 10% ou sem requisições');
    process.exit(1);
  }
  // Sob carga agressiva, 429 é proteção (não conta como falha de app)
  console.log('\nOK  carga + segurança dentro dos limites do protótipo');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
