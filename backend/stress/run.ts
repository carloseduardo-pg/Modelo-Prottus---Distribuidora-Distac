import {
  buildReport,
  loadConfig,
  loginAndGetCookie,
  printReport,
  runPool,
  timedFetch,
  type ScenarioReport,
  type StressConfig,
} from './helpers';

type LookupIds = {
  clientId: string;
  productId: string;
};

/**
 * Loads active client/product ids needed by write scenarios.
 */
async function loadLookups(
  config: StressConfig,
  cookie: string,
): Promise<LookupIds> {
  const headers = { Cookie: cookie };
  const [clientsRes, productsRes] = await Promise.all([
    fetch(`${config.baseUrl}/clients?page=1&pageSize=1`, { headers }),
    fetch(`${config.baseUrl}/products?page=1&pageSize=1`, { headers }),
  ]);
  if (!clientsRes.ok || !productsRes.ok) {
    throw new Error('Falha ao carregar lookups para stress de pedidos');
  }
  const clients = (await clientsRes.json()) as { data: { id: string }[] };
  const products = (await productsRes.json()) as { data: { id: string }[] };
  if (!clients.data[0] || !products.data[0]) {
    throw new Error('Seed insuficiente: precisa de ao menos 1 cliente e 1 produto');
  }
  return {
    clientId: clients.data[0].id,
    productId: products.data[0].id,
  };
}

/**
 * Floods POST /auth/login to measure auth throughput and throttling behavior.
 */
async function scenarioLoginFlood(config: StressConfig): Promise<ScenarioReport> {
  const { results, elapsedMs } = await runPool(
    { requests: config.requests, durationMs: config.durationMs },
    config.concurrency,
    async () =>
      timedFetch(`${config.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: config.email,
          password: config.password,
        }),
      }),
  );
  // 429 esperado sob flood; contabilizado como throttled no report.
  return buildReport('login-flood', results, elapsedMs, {
    ...config,
    // Login is intentionally harsher; allow higher latency.
    maxP95Ms: Math.max(config.maxP95Ms, 3000),
  });
}

/**
 * Authenticated read storm against list endpoints.
 */
async function scenarioReadStorm(
  config: StressConfig,
  cookie: string,
): Promise<ScenarioReport> {
  const paths = ['/clients', '/products', '/orders', '/users', '/auth/me'];
  const { results, elapsedMs } = await runPool(
    { requests: config.requests, durationMs: config.durationMs },
    config.concurrency,
    async (i) => {
      const path = paths[i % paths.length];
      return timedFetch(`${config.baseUrl}${path}?page=1&pageSize=20`, {
        headers: { Cookie: cookie },
      });
    },
  );
  return buildReport('read-storm', results, elapsedMs, config);
}

/**
 * Concurrent order creation (write path with nested items).
 */
async function scenarioOrderWrites(
  config: StressConfig,
  cookie: string,
  ids: LookupIds,
): Promise<ScenarioReport> {
  const writeRequests = Math.min(config.requests, 100);
  const { results, elapsedMs } = await runPool(
    { requests: writeRequests },
    Math.min(config.concurrency, 10),
    async (i) =>
      timedFetch(`${config.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          clientId: ids.clientId,
          status: 'DRAFT',
          notes: `stress-${Date.now()}-${i}`,
          items: [
            {
              productId: ids.productId,
              quantity: 1 + (i % 5),
            },
          ],
        }),
      }),
  );
  // 429 = ThrottlerGuard; contabilizado em buildReport como throttled, não falha de app.
  return buildReport('order-writes', results, elapsedMs, {
    ...config,
    maxP95Ms: Math.max(config.maxP95Ms, 2500),
  });
}

/**
 * Mixed workload: 70% reads, 20% login/me, 10% order create.
 */
async function scenarioMixed(
  config: StressConfig,
  cookie: string,
  ids: LookupIds,
): Promise<ScenarioReport> {
  const { results, elapsedMs } = await runPool(
    { requests: config.requests, durationMs: config.durationMs },
    config.concurrency,
    async (i) => {
      const roll = i % 10;
      if (roll === 0) {
        return timedFetch(`${config.baseUrl}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookie,
          },
          body: JSON.stringify({
            clientId: ids.clientId,
            status: 'DRAFT',
            notes: `mixed-${i}`,
            items: [{ productId: ids.productId, quantity: 1 }],
          }),
        });
      }
      if (roll <= 2) {
        return timedFetch(`${config.baseUrl}/auth/me`, {
          headers: { Cookie: cookie },
        });
      }
      const path = ['/clients', '/products', '/orders'][i % 3];
      return timedFetch(`${config.baseUrl}${path}?page=1&pageSize=10`, {
        headers: { Cookie: cookie },
      });
    },
  );
  return buildReport('mixed-workload', results, elapsedMs, config);
}

/**
 * Entry point: runs Distac stress scenarios and exits non-zero on soft failures.
 */
async function main() {
  const profile = process.argv[2] ?? 'all';
  const config = loadConfig(
    profile === 'smoke'
      ? { concurrency: 5, requests: 30, maxP95Ms: 3000, maxErrorRate: 0.1 }
      : profile === 'heavy'
        ? { concurrency: 50, requests: 1000, maxP95Ms: 3000, maxErrorRate: 0.1 }
        : {},
  );

  console.log('Distac stress tests');
  console.log(
    `baseUrl=${config.baseUrl} concurrency=${config.concurrency} requests=${config.requests} profile=${profile}`,
  );

  const health = await timedFetch(`${config.baseUrl}/auth/me`);
  if (health.status === 0) {
    console.error(
      `API inacessível em ${config.baseUrl}. Suba o backend (npm run start:dev) antes.`,
    );
    process.exit(1);
  }

  const cookie = await loginAndGetCookie(config);
  const ids = await loadLookups(config, cookie);
  const reports: ScenarioReport[] = [];

  // Leituras/escritas antes do login-flood: o throttler global (120/min)
  // é consumido pelo flood e poluiria os demais cenários se viesse primeiro.
  if (profile === 'read' || profile === 'all' || profile === 'smoke' || profile === 'heavy') {
    reports.push(await scenarioReadStorm(config, cookie));
  }
  if (profile === 'orders' || profile === 'all' || profile === 'smoke' || profile === 'heavy') {
    reports.push(await scenarioOrderWrites(config, cookie, ids));
  }
  if (profile === 'mixed' || profile === 'all' || profile === 'heavy') {
    reports.push(await scenarioMixed(config, cookie, ids));
  }
  if (profile === 'login' || profile === 'all' || profile === 'heavy') {
    if (process.env.STRESS_SKIP_LOGIN_FLOOD === '1') {
      console.log('Pulando login-flood (STRESS_SKIP_LOGIN_FLOOD=1).');
    } else {
      reports.push(await scenarioLoginFlood(config));
    }
  }

  for (const r of reports) printReport(r);

  const failed = reports.filter((r) => !r.passed);
  console.log(
    `\nResumo: ${reports.length - failed.length}/${reports.length} cenários passaram`,
  );
  process.exit(failed.length ? 1 : 0);
}

void main();
