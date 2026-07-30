import { OrderStatus, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SEED_TAG = '[SEED]';

/**
 * Seeds Distac demo data on English tables.
 * Order totals are owned by PostgreSQL triggers — do not set `total` here.
 */
async function main() {
  console.log('==> Distac seed — English domain');

  const passwordHash = await bcrypt.hash('distac123', 10);
  const seller = await prisma.user.upsert({
    where: { email: 'vendedor@distac.local' },
    update: { name: 'Vendedor Distac', passwordHash, active: true },
    create: {
      email: 'vendedor@distac.local',
      name: 'Vendedor Distac',
      passwordHash,
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@distac.local' },
    update: { name: 'Administrador Distac', passwordHash, active: true },
    create: {
      email: 'admin@distac.local',
      name: 'Administrador Distac',
      passwordHash,
      active: true,
    },
  });

  const clientsData = [
    {
      name: 'Casa Forte Materiais',
      document: '11222333000181',
      phone: '8132221100',
      email: 'compras@casaforte.pe',
      city: 'Recife',
      state: 'PE',
      active: true,
    },
    {
      name: 'Depósito Olinda Construções',
      document: '22333444000192',
      phone: '8133332200',
      email: 'pedidos@olindaconstrucoes.pe',
      city: 'Olinda',
      state: 'PE',
      active: true,
    },
    {
      name: 'Jaboatão Tudo em Obra',
      document: '33444555000103',
      phone: '8134443300',
      email: 'contato@tudoemobra.pe',
      city: 'Jaboatão dos Guararapes',
      state: 'PE',
      active: true,
    },
    {
      name: 'Caruaru Centro de Materiais',
      document: '44555666000114',
      phone: '8135554400',
      email: null,
      city: 'Caruaru',
      state: 'PE',
      active: true,
    },
  ];

  const clients = [];
  for (const data of clientsData) {
    clients.push(
      await prisma.client.upsert({
        where: { document: data.document },
        update: data,
        create: data,
      }),
    );
  }

  const productsData = [
    { sku: 'CIM-50', name: 'Cimento CP-II 50kg', unit: 'SC', price: 34.9, active: true },
    { sku: 'ARE-M3', name: 'Areia média lavada', unit: 'M3', price: 180.0, active: true },
    { sku: 'BRI-6F', name: 'Tijolo cerâmico 6 furos', unit: 'UN', price: 0.85, active: true },
    { sku: 'VER-10', name: 'Vergalhão CA-50 10mm', unit: 'BR', price: 42.5, active: true },
    { sku: 'BLO-14', name: 'Bloco de concreto 14x19x39', unit: 'UN', price: 3.2, active: true },
    { sku: 'TIN-18', name: 'Tinta acrílica branca 18L', unit: 'GL', price: 289.9, active: true },
  ];

  const products = [];
  for (const data of productsData) {
    products.push(
      await prisma.product.upsert({
        where: { sku: data.sku },
        update: data,
        create: data,
      }),
    );
  }

  const bySku = Object.fromEntries(products.map((p) => [p.sku, p]));
  const byDocument = Object.fromEntries(clients.map((c) => [c.document, c]));

  const seedOrders = await prisma.order.findMany({
    where: { notes: { startsWith: SEED_TAG } },
    select: { id: true },
  });
  if (seedOrders.length) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE order_items DISABLE TRIGGER trg_order_items_biud_calculate',
    );
    try {
      await prisma.order.deleteMany({
        where: { id: { in: seedOrders.map((o) => o.id) } },
      });
    } finally {
      await prisma.$executeRawUnsafe(
        'ALTER TABLE order_items ENABLE TRIGGER trg_order_items_biud_calculate',
      );
    }
  }

  async function createOrder(opts: {
    number: string;
    document: string;
    status: OrderStatus;
    notes: string;
    items: { sku: string; quantity: number; unitPrice?: number }[];
    orderedAt?: Date;
  }) {
    const client = byDocument[opts.document];
    const items = opts.items.map((item) => {
      const product = bySku[item.sku];
      const unitPrice = item.unitPrice ?? Number(product.price);
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        lineTotal: Number((item.quantity * unitPrice).toFixed(2)),
      };
    });

    const initialStatus =
      opts.status === OrderStatus.CANCELLED ? OrderStatus.DRAFT : opts.status;

    const created = await prisma.order.create({
      data: {
        number: opts.number,
        clientId: client.id,
        userId: seller.id,
        status: initialStatus,
        notes: `${SEED_TAG} ${opts.notes}`,
        orderedAt: opts.orderedAt ?? new Date(),
        items: { create: items },
      },
      include: { items: true, client: true },
    });

    if (opts.status === OrderStatus.CANCELLED) {
      return prisma.order.update({
        where: { id: created.id },
        data: { status: OrderStatus.CANCELLED },
        include: { items: true, client: true },
      });
    }
    return created;
  }

  const orders = [
    await createOrder({
      number: 'PED-2026-00001',
      document: '11222333000181',
      status: OrderStatus.CONFIRMED,
      notes: 'Obra residencial — Casa Forte',
      orderedAt: new Date('2026-07-10T14:00:00-03:00'),
      items: [
        { sku: 'CIM-50', quantity: 40 },
        { sku: 'ARE-M3', quantity: 2 },
        { sku: 'BRI-6F', quantity: 1500 },
      ],
    }),
    await createOrder({
      number: 'PED-2026-00002',
      document: '22333444000192',
      status: OrderStatus.DRAFT,
      notes: 'Reposição de estoque — Olinda',
      orderedAt: new Date('2026-07-18T09:30:00-03:00'),
      items: [
        { sku: 'VER-10', quantity: 25 },
        { sku: 'BLO-14', quantity: 800 },
        { sku: 'CIM-50', quantity: 20 },
      ],
    }),
    await createOrder({
      number: 'PED-2026-00003',
      document: '33444555000103',
      status: OrderStatus.CONFIRMED,
      notes: 'Pintura e acabamento — Jaboatão',
      orderedAt: new Date('2026-07-20T16:15:00-03:00'),
      items: [
        { sku: 'TIN-18', quantity: 6 },
        { sku: 'BRI-6F', quantity: 400 },
      ],
    }),
    await createOrder({
      number: 'PED-2026-00004',
      document: '44555666000114',
      status: OrderStatus.CANCELLED,
      notes: 'Cliente cancelou frete — Caruaru',
      orderedAt: new Date('2026-07-05T11:00:00-03:00'),
      items: [
        { sku: 'ARE-M3', quantity: 5 },
        { sku: 'CIM-50', quantity: 10 },
      ],
    }),
  ];

  console.log('OK  users: 2');
  console.log('OK  clients:', clients.length);
  console.log('OK  products:', products.length);
  console.log(
    'OK  orders:',
    orders
      .map((o) => `${o.number} ${o.status} (${o.items.length} items, total ${o.total})`)
      .join(' | '),
  );
  console.log('Login seed: vendedor@distac.local / distac123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
