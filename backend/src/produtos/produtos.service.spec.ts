import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProdutosService } from './produtos.service';

describe('ProdutosService', () => {
  let service: ProdutosService;
  const prisma = {
    produto: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    pedidoItem: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutosService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(ProdutosService);
  });

  it('create com código duplicado lança ConflictException', async () => {
    const err = new Prisma.PrismaClientKnownRequestError('dup', {
      code: 'P2002',
      clientVersion: 'test',
    });
    prisma.produto.create.mockRejectedValue(err);

    await expect(
      service.create({
        codigo: 'CIMENTO',
        nome: 'Cimento',
        unidade: 'SC',
        preco: 32,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('get com id inexistente lança NotFoundException', async () => {
    prisma.produto.findUnique.mockResolvedValue(null);
    await expect(service.get('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('remove com itens vinculados desativa em vez de apagar', async () => {
    prisma.produto.findUnique.mockResolvedValue({
      id: 'p1',
      codigo: 'CIMENTO',
      ativo: true,
    });
    prisma.pedidoItem.count.mockResolvedValue(1);
    prisma.produto.update.mockResolvedValue({ id: 'p1', ativo: false });

    const result = await service.remove('p1');

    expect(prisma.produto.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { ativo: false },
    });
    expect(prisma.produto.delete).not.toHaveBeenCalled();
    expect(result).toMatchObject({ id: 'p1', ativo: false });
  });
});
