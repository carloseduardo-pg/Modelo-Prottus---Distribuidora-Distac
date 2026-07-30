import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  const prisma = {
    client: { findFirst: jest.fn() },
    product: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(OrdersService);
  });

  it('rejects an inactive or unknown client before creating an order', async () => {
    prisma.client.findFirst.mockResolvedValue(null);

    await expect(
      service.create('user-id', {
        clientId: 'client-id',
        items: [{ productId: 'product-id', quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
