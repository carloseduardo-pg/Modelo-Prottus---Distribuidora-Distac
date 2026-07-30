import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ClientsService } from './clients.service';

describe('ClientsService', () => {
  let service: ClientsService;
  const prisma = {
    client: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(ClientsService);
  });

  it('rejects a duplicated normalized document', async () => {
    prisma.client.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create({ name: 'ACME', document: '12.345.678/0001-90' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws when a client does not exist', async () => {
    prisma.client.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
