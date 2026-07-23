import { PedidoStatus, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_TAG = '[SEED]';

async function main() {
  console.log('==> Distac seed — exemplos relacionados');

  const passwordHash = await bcrypt.hash('distac123', 10);
  await prisma.user.upsert({
    where: { email: 'vendedor@distac.local' },
    update: { name: 'Vendedor Distac', passwordHash, active: true },
    create: {
      email: 'vendedor@distac.local',
      name: 'Vendedor Distac',
      passwordHash,
      active: true,
    },
  });

  const clientesData = [
    {
      nome: 'Casa Forte Materiais',
      cnpj: '11222333000181',
      telefone: '8132221100',
      email: 'compras@casaforte.pe',
      cidade: 'Recife',
      ativo: true,
    },
    {
      nome: 'Depósito Olinda Construções',
      cnpj: '22333444000192',
      telefone: '8133332200',
      email: 'pedidos@olindaconstrucoes.pe',
      cidade: 'Olinda',
      ativo: true,
    },
    {
      nome: 'Jaboatão Tudo em Obra',
      cnpj: '33444555000103',
      telefone: '8134443300',
      email: 'contato@tudoemobra.pe',
      cidade: 'Jaboatão dos Guararapes',
      ativo: true,
    },
    {
      nome: 'Caruaru Centro de Materiais',
      cnpj: '44555666000114',
      telefone: '8135554400',
      email: null,
      cidade: 'Caruaru',
      ativo: true,
    },
  ];

  const clientes = [];
  for (const data of clientesData) {
    const row = await prisma.cliente.upsert({
      where: { cnpj: data.cnpj },
      update: data,
      create: data,
    });
    clientes.push(row);
  }

  const produtosData = [
    {
      codigo: 'CIM-50',
      nome: 'Cimento CP-II 50kg',
      unidade: 'SC',
      preco: 34.9,
      ativo: true,
    },
    {
      codigo: 'ARE-M3',
      nome: 'Areia média lavada',
      unidade: 'M3',
      preco: 180.0,
      ativo: true,
    },
    {
      codigo: 'BRI-6F',
      nome: 'Tijolo cerâmico 6 furos',
      unidade: 'UN',
      preco: 0.85,
      ativo: true,
    },
    {
      codigo: 'VER-10',
      nome: 'Vergalhão CA-50 10mm',
      unidade: 'BR',
      preco: 42.5,
      ativo: true,
    },
    {
      codigo: 'BLO-14',
      nome: 'Bloco de concreto 14x19x39',
      unidade: 'UN',
      preco: 3.2,
      ativo: true,
    },
    {
      codigo: 'TIN-18',
      nome: 'Tinta acrílica branca 18L',
      unidade: 'GL',
      preco: 289.9,
      ativo: true,
    },
  ];

  const produtos = [];
  for (const data of produtosData) {
    const row = await prisma.produto.upsert({
      where: { codigo: data.codigo },
      update: data,
      create: data,
    });
    produtos.push(row);
  }

  const byCodigo = Object.fromEntries(produtos.map((p) => [p.codigo, p]));
  const byCnpj = Object.fromEntries(clientes.map((c) => [c.cnpj, c]));

  // Remove pedidos de exemplo anteriores (marcados) e recria.
  // Triggers bloqueiam alterar/apagar itens de cancelado — desliga só na limpeza do seed.
  const seedPedidos = await prisma.pedido.findMany({
    where: { observacao: { startsWith: SEED_TAG } },
    select: { id: true },
  });
  if (seedPedidos.length) {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE pedido_item DISABLE TRIGGER trg_pedido_item_biud_calc',
    );
    await prisma.$executeRawUnsafe(
      'ALTER TABLE pedido DISABLE TRIGGER trg_pedido_bu_integridade',
    );
    try {
      await prisma.pedido.deleteMany({
        where: { id: { in: seedPedidos.map((p) => p.id) } },
      });
    } finally {
      await prisma.$executeRawUnsafe(
        'ALTER TABLE pedido ENABLE TRIGGER trg_pedido_bu_integridade',
      );
      await prisma.$executeRawUnsafe(
        'ALTER TABLE pedido_item ENABLE TRIGGER trg_pedido_item_biud_calc',
      );
    }
  }

  async function criarPedido(opts: {
    cnpj: string;
    status: PedidoStatus;
    observacao: string;
    itens: { codigo: string; quantidade: number; precoUnitario?: number }[];
    data?: Date;
  }) {
    const cliente = byCnpj[opts.cnpj];
    const itens = opts.itens.map((i) => {
      const produto = byCodigo[i.codigo];
      const precoUnitario = i.precoUnitario ?? Number(produto.preco);
      const subtotal = Number((i.quantidade * precoUnitario).toFixed(2));
      return {
        produtoId: produto.id,
        quantidade: i.quantidade,
        precoUnitario,
        subtotal,
      };
    });
    const total = Number(
      itens.reduce((acc, i) => acc + Number(i.subtotal), 0).toFixed(2),
    );

    // Itens só entram com pedido aberto; cancelado é aplicado depois (integridade no banco).
    const statusInicial =
      opts.status === PedidoStatus.cancelado
        ? PedidoStatus.rascunho
        : opts.status;

    const criado = await prisma.pedido.create({
      data: {
        clienteId: cliente.id,
        status: statusInicial,
        observacao: `${SEED_TAG} ${opts.observacao}`,
        total,
        data: opts.data ?? new Date(),
        itens: { create: itens },
      },
      include: { itens: true, cliente: true },
    });

    if (opts.status === PedidoStatus.cancelado) {
      return prisma.pedido.update({
        where: { id: criado.id },
        data: { status: PedidoStatus.cancelado },
        include: { itens: true, cliente: true },
      });
    }
    return criado;
  }

  const p1 = await criarPedido({
    cnpj: '11222333000181',
    status: PedidoStatus.confirmado,
    observacao: 'Obra residencial — Casa Forte',
    data: new Date('2026-07-10T14:00:00-03:00'),
    itens: [
      { codigo: 'CIM-50', quantidade: 40 },
      { codigo: 'ARE-M3', quantidade: 2 },
      { codigo: 'BRI-6F', quantidade: 1500 },
    ],
  });

  const p2 = await criarPedido({
    cnpj: '22333444000192',
    status: PedidoStatus.rascunho,
    observacao: 'Reposição de estoque — Olinda',
    data: new Date('2026-07-18T09:30:00-03:00'),
    itens: [
      { codigo: 'VER-10', quantidade: 25 },
      { codigo: 'BLO-14', quantidade: 800 },
      { codigo: 'CIM-50', quantidade: 20 },
    ],
  });

  const p3 = await criarPedido({
    cnpj: '33444555000103',
    status: PedidoStatus.confirmado,
    observacao: 'Pintura e acabamento — Jaboatão',
    data: new Date('2026-07-20T16:15:00-03:00'),
    itens: [
      { codigo: 'TIN-18', quantidade: 6 },
      { codigo: 'BRI-6F', quantidade: 400 },
    ],
  });

  const p4 = await criarPedido({
    cnpj: '44555666000114',
    status: PedidoStatus.cancelado,
    observacao: 'Cliente cancelou frete — Caruaru',
    data: new Date('2026-07-05T11:00:00-03:00'),
    itens: [
      { codigo: 'ARE-M3', quantidade: 5 },
      { codigo: 'CIM-50', quantidade: 10 },
    ],
  });

  console.log('OK  usuários:', 1);
  console.log('OK  clientes:', clientes.length);
  console.log('OK  produtos:', produtos.length);
  console.log(
    'OK  pedidos:',
    [p1, p2, p3, p4]
      .map((p) => `${p.status} (${p.itens.length} itens, total ${p.total})`)
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
