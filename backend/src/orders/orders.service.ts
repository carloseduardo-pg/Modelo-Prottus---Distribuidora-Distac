import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import {
  pageResult,
  skipTake,
  type PageParams,
} from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, OrderItemDto, UpdateOrderDto } from './dto/order.dto';

const orderInclude = {
  client: { select: { id: true, name: true, document: true } },
  user: { select: { id: true, name: true, email: true } },
  items: {
    include: {
      product: { select: { id: true, sku: true, name: true, unit: true } },
    },
  },
} satisfies Prisma.OrderInclude;

/**
 * CRUD service for sales orders with embedded items.
 */
@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lists orders with optional filters.
   */
  async findAll(
    params: {
      search?: string;
      status?: OrderStatus;
    } & PageParams,
  ) {
    const where: Prisma.OrderWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.search
        ? {
            OR: [
              { number: { contains: params.search, mode: 'insensitive' } },
              {
                client: {
                  name: { contains: params.search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };
    const { skip, take } = skipTake(params);
    const [total, data] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: orderInclude,
        orderBy: { orderedAt: 'desc' },
        skip,
        take,
      }),
    ]);
    return pageResult(data, total, params);
  }

  /** Returns one order with items. */
  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException('Pedido não encontrado');
    return order;
  }

  /**
   * Creates an order for the authenticated seller.
   * Uses a Postgres advisory lock so order numbers stay unique under concurrency.
   */
  async create(userId: string, dto: CreateOrderDto) {
    const client = await this.prisma.client.findFirst({
      where: { id: dto.clientId, active: true },
    });
    if (!client) throw new BadRequestException('Cliente inválido ou inativo');

    const lines = await this.buildLines(dto.items);

    const order = await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(87451203)`;
      const number = await this.nextNumber(tx);
      return tx.order.create({
        data: {
          number,
          clientId: dto.clientId,
          userId,
          status: dto.status ?? OrderStatus.DRAFT,
          notes: dto.notes,
          items: {
            create: lines.map((l) => ({
              productId: l.productId,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              lineTotal: l.lineTotal,
            })),
          },
        },
      });
    });
    // PostgreSQL triggers own lineTotal and Order.total; re-read their result.
    return this.findOne(order.id);
  }

  /**
   * Updates order header and optionally replaces items.
   */
  async update(id: string, dto: UpdateOrderDto) {
    await this.findOne(id);
    if (dto.clientId) {
      const client = await this.prisma.client.findFirst({
        where: { id: dto.clientId, active: true },
      });
      if (!client) throw new BadRequestException('Cliente inválido ou inativo');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.items) {
        const lines = await this.buildLines(dto.items);
        await tx.orderItem.deleteMany({ where: { orderId: id } });
        await tx.orderItem.createMany({
          data: lines.map((l) => ({
            orderId: id,
            productId: l.productId,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            lineTotal: l.lineTotal,
          })),
        });
      }
      await tx.order.update({
        where: { id },
        data: {
          clientId: dto.clientId,
          status: dto.status,
          notes: dto.notes,
        },
      });
      return tx.order.findUniqueOrThrow({
        where: { id },
        include: orderInclude,
      });
    });
  }

  /**
   * Cancels an order (status CANCELLED).
   */
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
      include: orderInclude,
    });
  }

  private async buildLines(items: OrderItemDto[]) {
    const productIds = items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));
    return items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) {
        throw new BadRequestException(
          `Produto inválido ou inativo: ${item.productId}`,
        );
      }
      const unitPrice =
        item.unitPrice !== undefined
          ? item.unitPrice
          : Number(product.price);
      const quantity = item.quantity;
      const lineTotal = Number((quantity * unitPrice).toFixed(2));
      return {
        productId: item.productId,
        quantity,
        unitPrice,
        lineTotal,
      };
    });
  }

  private async nextNumber(
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PED-${year}-`;
    const last = await tx.order.findFirst({
      where: { number: { startsWith: prefix } },
      orderBy: { number: 'desc' },
      select: { number: true },
    });
    const seq = last ? Number(last.number.slice(prefix.length)) + 1 : 1;
    return `${prefix}${String(seq).padStart(5, '0')}`;
  }
}
