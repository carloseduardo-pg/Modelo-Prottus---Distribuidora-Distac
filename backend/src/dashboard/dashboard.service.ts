import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Contagens + últimos pedidos para a Home (evita N listagens completas). */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Agrega counts e 5 pedidos recentes sem carregar CRUDs inteiros. */
  async summary() {
    const [
      clientes,
      produtos,
      pedidos,
      confirmados,
      rascunhos,
      cancelados,
      recentes,
    ] = await Promise.all([
      this.prisma.cliente.count(),
      this.prisma.produto.count(),
      this.prisma.pedido.count(),
      this.prisma.pedido.count({ where: { status: 'confirmado' } }),
      this.prisma.pedido.count({ where: { status: 'rascunho' } }),
      this.prisma.pedido.count({ where: { status: 'cancelado' } }),
      this.prisma.pedido.findMany({
        take: 5,
        orderBy: { data: 'desc' },
        include: {
          cliente: true,
          itens: { select: { id: true } },
        },
      }),
    ]);

    return {
      clientes,
      produtos,
      pedidos,
      confirmados,
      rascunhos,
      cancelados,
      recentes: recentes.map((p) => ({
        id: p.id,
        data: p.data,
        status: p.status,
        total: p.total,
        clienteId: p.clienteId,
        cliente: p.cliente ? { id: p.cliente.id, nome: p.cliente.nome } : null,
        itensCount: p.itens.length,
      })),
    };
  }
}
