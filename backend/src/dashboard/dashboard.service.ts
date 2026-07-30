import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Counts + recent orders for the hub (avoids N full list calls). */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Aggregates counts and 5 recent orders without loading full CRUDs. */
  async summary() {
    const [clients, products, orders, confirmed, drafts, cancelled, recent] =
      await Promise.all([
        this.prisma.client.count(),
        this.prisma.product.count(),
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: OrderStatus.CONFIRMED } }),
        this.prisma.order.count({ where: { status: OrderStatus.DRAFT } }),
        this.prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
        this.prisma.order.findMany({
          take: 5,
          orderBy: { orderedAt: 'desc' },
          include: {
            client: { select: { id: true, name: true } },
            items: { select: { id: true } },
          },
        }),
      ]);

    return {
      clients,
      products,
      orders,
      confirmed,
      drafts,
      cancelled,
      recent: recent.map((order) => ({
        id: order.id,
        number: order.number,
        orderedAt: order.orderedAt,
        status: order.status,
        total: order.total,
        clientId: order.clientId,
        client: order.client,
        itemsCount: order.items.length,
      })),
    };
  }
}
