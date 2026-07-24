import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PedidoStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PedidosService } from './pedidos.service';

describe('PedidosService', () => {
  let service: PedidosService;
  const prisma = {
    cliente: { findUnique: jest.fn() },
    produto: { findMany: jest.fn() },
    pedido: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    pedidoItem: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [PedidosService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(PedidosService);
  });

  it('create com cliente inativo lança BadRequestException', async () => {
    prisma.cliente.findUnique.mockResolvedValue({
      id: 'c1',
      ativo: false,
    });

    await expect(
      service.create({
        clienteId: 'c1',
        itens: [{ produtoId: 'p1', quantidade: 1 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create com produto inexistente/inativo lança BadRequestException', async () => {
    prisma.cliente.findUnique.mockResolvedValue({ id: 'c1', ativo: true });
    prisma.produto.findMany.mockResolvedValue([]);

    await expect(
      service.create({
        clienteId: 'c1',
        itens: [{ produtoId: 'p-missing', quantidade: 2 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('update de pedido cancelado lança BadRequestException', async () => {
    prisma.pedido.findUnique.mockResolvedValue({
      id: 'ped1',
      status: PedidoStatus.cancelado,
      cliente: {},
      itens: [],
    });

    await expect(
      service.update('ped1', { observacao: 'x' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create sem precoUnitario usa preço do produto e calcula subtotal', async () => {
    prisma.cliente.findUnique.mockResolvedValue({ id: 'c1', ativo: true });
    prisma.produto.findMany.mockResolvedValue([
      { id: 'p1', preco: 10, ativo: true },
    ]);
    prisma.pedido.create.mockResolvedValue({
      id: 'ped1',
      clienteId: 'c1',
      itens: [],
    });
    prisma.pedido.findUnique.mockResolvedValue({
      id: 'ped1',
      total: 20,
      cliente: {},
      itens: [],
    });

    await service.create({
      clienteId: 'c1',
      itens: [{ produtoId: 'p1', quantidade: 2 }],
    });

    const calls = prisma.pedido.create.mock.calls as unknown as Array<
      [
        {
          data: {
            total?: number;
            itens: {
              create: Array<{
                produtoId: string;
                quantidade: number;
                precoUnitario: number;
                subtotal: number;
              }>;
            };
          };
        },
      ]
    >;
    const createArg = calls[0][0];
    expect(createArg.data.itens.create[0]).toEqual(
      expect.objectContaining({
        produtoId: 'p1',
        quantidade: 2,
        precoUnitario: 10,
        subtotal: 20,
      }),
    );
    expect(createArg.data.total).toBeUndefined();
  });
});
