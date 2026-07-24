import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ClientesService } from './clientes.service';

describe('ClientesService', () => {
  let service: ClientesService;
  const prisma = {
    cliente: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    pedido: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(ClientesService);
  });

  it('create com CNPJ duplicado lança ConflictException', async () => {
    const err = new Prisma.PrismaClientKnownRequestError('dup', {
      code: 'P2002',
      clientVersion: 'test',
    });
    prisma.cliente.create.mockRejectedValue(err);

    await expect(
      service.create({
        nome: 'ACME',
        cnpj: '12345678000199',
        cidade: 'Recife',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('get com id inexistente lança NotFoundException', async () => {
    prisma.cliente.findUnique.mockResolvedValue(null);
    await expect(service.get('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('remove com pedidos vinculados desativa em vez de apagar', async () => {
    prisma.cliente.findUnique.mockResolvedValue({
      id: 'c1',
      nome: 'ACME',
      ativo: true,
    });
    prisma.pedido.count.mockResolvedValue(2);
    prisma.cliente.update.mockResolvedValue({
      id: 'c1',
      ativo: false,
    });

    const result = await service.remove('c1');

    expect(prisma.cliente.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { ativo: false },
    });
    expect(prisma.cliente.delete).not.toHaveBeenCalled();
    expect(result).toMatchObject({ id: 'c1', ativo: false });
  });
});
